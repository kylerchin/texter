import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config()

const sid = process.env.TWILIO_SID
const token = process.env.TWILIO_AUTH_TOKEN

console.log('sid', sid, 'token', token)

const client = twilio(sid, token)

const filterOpts = {
  category: 'sms-outbound',
  startDate: '2018-03-17',
  endDate: '2018-03-19',
  done: () => {
    hasFinished = true
    console.log('REALLY DONE')
    process.exit(0)
  },
}

const countRecords = () => {}
const count = 0

const records = []

let hasFinished = false
// console.log('record length', records.length)
const main = async () => {
  // await client.usage.records.each((record) => console.log(record.count))
  client.usage.records.each(filterOpts, (record) => console.log(++count))
  // console.log('done')
  // process.exit(0)
}

main()
;(function wait() {
  if (!hasFinished) setTimeout(wait, 1000)
})()
