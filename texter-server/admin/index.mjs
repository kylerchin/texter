import * as DB from '../src/db'
import phoneFormatter from 'phone-formatter'
import dotenv from 'dotenv'

dotenv.config()

const db = new DB.Database(async (_) => {
  // const allMembers = await db.member.listAll()

  // let numMembers = 0
  // for (const member of allMembers) {
  //   await db.member.update(member._id, {
  //     ...member,
  //     phone: phoneFormatter.normalize(member.phone),
  //   })
  //   numMembers++
  // }

  // console.log(`Done. Formatted ${numMembers} members.`)

  const latestMe = await db.member.getByPhone('+1 (310) 237-2273')
  console.log('latest me: ', JSON.stringify(latestMe, null, 2))
})
