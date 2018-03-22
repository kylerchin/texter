const { createError, send } = require('micro')
const Mongo = require('mongodb')
const phoneFormatter = require('phone-formatter')
const Firebase = require('firebase')
const parse = require('urlencoded-body-parser')
require('dotenv').config()

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

const ID = (i) => new Mongo.ObjectID(i)

module.exports = async (req, res) => {
  const body = await parse(req)

  const db = await setupDatabase()
  const fb = setupFirebase()

  const member = await getMemberByPhone(db, body.From)
  if (member) {
    await addMessageToFirebase(fb, body, member)
    await newUnread(db, member.segmentId)
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  send(res, 200)
}

const addMessageToFirebase = async (fb, message, member) => {
  if (!message || !message.From || !message.To || !message.Body) {
    return
  }

  return fb.ref(`segments/${member.segmentId}/messages/${member._id}/${message.MessageSid}`).set({
    from: message.From,
    to: message.To,
    body: message.Body,
    timestamp: Date.now(),
  })
}

const setupDatabase = () => {
  return new Promise((resolve, reject) => {
    Mongo.MongoClient.connect(process.env.DATABASE_URL, (err, client) => {
      if (err) {
        reject(err)
      }

      resolve(client.db('texter-db'))
    })
  })
}

const setupFirebase = () => {
  const firebase = !Firebase.apps.length
    ? Firebase.initializeApp({
        apiKey: process.env.FB_API_KEY,
        autDomain: process.env.FB_AUTH_DOMAIN,
        databaseURL: process.env.FB_DATABASE_URL,
        projectId: process.env.FB_PROJECT_ID,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
      })
    : Firebase.app()

  return firebase.database()
}

const getMemberByPhone = async (db, phone) => {
  const allMembers = await db
    .collection('members')
    .find({ phone: phoneFormatter.normalize(phone) })
    .toArray()

  let latestMember = allMembers[0]
  let latestTime = 0
  for (const member of allMembers) {
    const segment = await db.collection('segments').findOne({ _id: ID(member.segmentId) })
    if (segment && segment.lastCampaignTime > latestTime) {
      latestTime = segment.lastCampaignTime
      latestMember = member
    }
  }
  return latestMember
}

const newUnread = async (db, segmentId) => {
  const { unread } = await db.collection('segments').findOne({ _id: ID(segmentId) })
  return db
    .collection('segments')
    .updateOne({ _id: ID(segmentId) }, { $set: { unread: unread + 1 } })
}
