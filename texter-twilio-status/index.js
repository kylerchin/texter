const { json, createError, send } = require('micro')
const Mongo = require('mongodb')
const phoneFormatter = require('phone-formatter')
const parse = require('urlencoded-body-parser')
require('dotenv').config()

const ID = (i) => new Mongo.ObjectID(i)

const setupDatabase = () => {
  return new Promise((resolve, reject) => {
    Mongo.MongoClient.connect(
      process.env.DATABASE_URL,
      (err, client) => {
        if (err) {
          reject(err)
        }

        resolve(client.db('texter-db'))
      }
    )
  })
}

let db

setupDatabase().then((d) => {
  db = d
})

const handleValidMessage = async (message) => {
  if (!db) {
    db = await setupDatabase()
  }

  const member = await getMemberByPhone(db, message.To)
  if (!member) {
    console.error('Unable to find member associated with message', message)
    return
  }

  switch (message.MessageStatus) {
    case 'delivered':
      await messageDelivered(db, member.segmentId)
      break
    case 'undelivered':
      await messageFailed(db, member.segmentId)
      await invalidUser(db, member._id)
      break
    case 'failed':
      await messageFailed(db, member.segmentId)
      await invalidUser(db, member._id)
      break
    case 'queued':
      await messageQueued(db, member.segmentId)
      await messageUnknown(db, member.segmentId, -1)
      break
    case 'sent':
      await messageSent(db, member.segmentId)
      await messageQueued(db, member.segmentId, -1)
      break
    default:
      console.warn('Unknown message status:', JSON.stringify(message, null, 2))
      break
  }
}

module.exports = async (req, res) => {
  const message = await parse(req)

  if (!message || !message.MessageStatus || !message.To) {
    console.error('Invalid message object received', JSON.stringify(message, null, 2))
    send(res, 400)
    return
  }

  handleValidMessage(message)

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  send(res, 200)
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

const invalidUser = async (db, userId) => {
  return db.collection('members').updateOne({ _id: ID(userId) }, { $set: { invalid: true } })
}

const messageDelivered = async (db, segmentId, increment = 1) => {
  const { messagesDelivered } = await db.collection('segments').findOne({ _id: ID(segmentId) })
  return db
    .collection('segments')
    .updateOne(
      { _id: ID(segmentId) },
      { $set: { messagesDelivered: (messagesDelivered || 0) + increment } }
    )
}

const messageFailed = async (db, segmentId, increment = 1) => {
  const { messagesFailed } = await db.collection('segments').findOne({ _id: ID(segmentId) })
  return db
    .collection('segments')
    .updateOne(
      { _id: ID(segmentId) },
      { $set: { messagesFailed: (messagesFailed || 0) + increment } }
    )
}

const messageQueued = async (db, segmentId, increment = 1) => {
  const { messagesQueued } = await db.collection('segments').findOne({ _id: ID(segmentId) })
  return db
    .collection('segments')
    .updateOne(
      { _id: ID(segmentId) },
      { $set: { messagesQueued: (messagesQueued || 0) + increment } }
    )
}

const messageSent = async (db, segmentId, increment = 1) => {
  const { messagesSent } = await db.collection('segments').findOne({ _id: ID(segmentId) })
  return db
    .collection('segments')
    .updateOne({ _id: ID(segmentId) }, { $set: { messagesSent: (messagesSent || 0) + increment } })
}

const messageUnknown = async (db, segmentId, increment = 1) => {
  const { messagesUnknown } = await db.collection('segments').findOne({ _id: ID(segmentId) })
  return db
    .collection('segments')
    .updateOne(
      { _id: ID(segmentId) },
      { $set: { messagesUnknown: (messagesUnknown || 0) + increment } }
    )
}
