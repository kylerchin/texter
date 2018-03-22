const { json, createError, send } = require('micro')
const twilio = require('twilio')
const format = require('string-template')
const phoneFormatter = require('phone-formatter')
require('dotenv').config()

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

module.exports = async (req, res) => {
  const body = await json(req, { limit: '100mb' })
  if (
    !body ||
    !body.message ||
    !body.users ||
    typeof body.message !== 'string' ||
    !Array.isArray(body.users)
  ) {
    throw createError(400, 'Invalid parameters')
  }

  main(body)
  send(res, 200)
}

const main = async (body) => {
  try {
    console.log(`Messaging ${body.users.length} users...`)
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

    for (const user of body.users) {
      if (!user || typeof user !== 'object' || !user.phone || typeof user.phone !== 'string') {
        console.log('Skipping invalid user', user)
        continue
      }

      await client.messages.create({
        to: phoneFormatter.format(user.phone, '+1NNNNNNNNNN'),
        messagingServiceSid: process.env.TWILIO_SERVICE_SID,
        statusCallback: 'https://texter-server.now.sh/twilio',
        body: format(body.message, user),
      })
      await sleep(100)
    }

    console.log('Messages sent.')
  } catch (error) {
    console.log('error', error)
  }
}
