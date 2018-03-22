// @ts-check
import Mongo from 'mongodb'
import phoneFormatter from 'phone-formatter'

import { hasKeys } from './util'

export const COLS = {
  campaigns: 'campaigns',
  segments: 'segments',
  members: 'members',
}

const ID = (i) => new Mongo.ObjectID(i)

export class Database {
  constructor(callback) {
    Mongo.MongoClient.connect(process.env.DATABASE_URL, async (err, client) => {
      if (err) {
        return console.log(err)
      }

      this.db = client.db('texter-db')

      this.campaign = new Campaign(this.db)
      this.member = new Member(this.db)
      this.segment = new Segment(this.db, this.member)

      await this.db.collection('members').createIndex({ segmentId: 1 })

      callback(this.db)
    })
  }
}

export const initialize = async (callback) => {
  Mongo.MongoClient.connect(process.env.DATABASE_URL, async (err, client) => {
    if (err) {
      return console.log(err)
    }

    const db = client.db('texter-db')

    await db.collection('members').createIndex({ segmentId: 1 })

    callback(db)
  })
}

class Campaign {
  constructor(db) {
    this.db = db
    this.collection = this.db.collection(COLS.campaigns)
  }

  async list() {
    return this.collection.find().toArray()
  }

  async get(id) {
    return this.collection.findOne({ _id: ID(id) })
  }

  async create(data) {
    const { insertedId } = await this.collection.insertOne({
      ...data,
      segmentId: ID(data.segmentId),
    })

    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async launch(id) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: { sent: true } })
  }

  async delete(id) {
    return this.collection.deleteOne({ _id: ID(id) })
  }
}

/**
 * SEGMENTS
 */

class Segment {
  constructor(db, member) {
    this.db = db
    this.member = member
    this.collection = this.db.collection(COLS.segments)
  }

  async list() {
    return this.collection.find().toArray()
  }

  async get(id) {
    const metadata = await this.collection.findOne({ _id: ID(id) })
    const members = await this.member.list(id)
    return { ...metadata, members }
  }

  async create(data) {
    const { insertedId } = await this.collection.insertOne({
      name: data.name,
      numMembers: data.members ? data.members.length : 0,
      unread: 0,
    })

    if (data.members && data.members.length > 0) {
      await this.member.createMany(insertedId, data.members)
    }

    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async update(id, data) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async newUnread(id) {
    const { unread } = await this.collection.findOne({ _id: ID(id) })
    return this.collection.updateOne({ _id: ID(id) }, { $set: { unread: unread + 1 } })
  }

  async clearUnreads(id) {
    return this.collection.updateOne({ _id: ID(id) }, { $set: { unread: 0 } })
  }

  async delete(id) {
    await this.collection.deleteOne({ _id: ID(id) })
    await this.db.collection(COLS.campaigns).deleteMany({ segmentId: ID(id) })
    await this.member.deleteMany(id)
    return
  }
}

/**
 * MEMBERS
 */

class Member {
  constructor(db) {
    this.db = db
    this.collection = this.db.collection(COLS.members)
  }

  async listAll() {
    return this.collection.find().toArray()
  }

  async list(segmentId) {
    return this.collection.find({ segmentId: ID(segmentId) }).toArray()
  }

  async get(id) {
    return this.collection.findOne({ _id: ID(id) })
  }

  async getByPhone(phone) {
    const allMembers = await this.collection
      .find({ phone: phoneFormatter.normalize(phone) })
      .toArray()
    let latestMember = allMembers[0]
    let latestTime = 0
    for (const member of allMembers) {
      const segment = await this.db.collection(COLS.segments).findOne({ _id: ID(member.segmentId) })
      if (segment && segment.lastCampaignTime > latestTime) {
        latestTime = segment.lastCampaignTime
        latestMember = member
      }
    }
    return latestMember
  }

  async create(segmentId, data) {
    data.phone = phoneFormatter.normalize(data.phone)
    const { insertedId } = this.collection.insertOne({ ...data, segmentId: ID(segmentId) })
    const { numMembers } = await this.db.collection(COLS.segments).findOne({ _id: ID(segmentId) })
    await this.db
      .collection(COLS.segments)
      .updateOne({ _id: ID(segmentId) }, { $set: { numMembers: numMembers + 1 } })
    return {
      ...data,
      _id: ID(insertedId),
    }
  }

  async createMany(segmentId, members) {
    const taggedMembers = members.map((member) => ({
      ...member,
      phone: phoneFormatter.normalize(member.phone),
      segmentId: ID(segmentId),
    }))

    return this.collection.insertMany(taggedMembers)
  }

  async update(id, data) {
    if (data.phone) {
      data.phone = phoneFormatter.normalize(data.phone)
    }
    return this.collection.updateOne({ _id: ID(id) }, { $set: data })
  }

  async delete(id) {
    const member = await this.collection.findOne({ _id: ID(id) })

    const { numMembers } = await this.db
      .collection(COLS.segments)
      .findOne({ _id: ID(member.segmentId) })
    await this.db
      .collection(COLS.segments)
      .updateOne({ _id: ID(member.segmentId) }, { $set: { numMembers: numMembers - 1 } })

    return this.collection.deleteOne({ _id: ID(id) })
  }

  async deleteMany(segmentId) {
    return this.collection.deleteMany({ segmentId: ID(segmentId) })
  }
}
