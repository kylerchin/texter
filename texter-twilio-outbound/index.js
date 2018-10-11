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

const hasMediaUrl = (body) => {
  return !!body.mediaUrl && typeof body.mediaUrl === 'string' && body.mediaUrl.indexOf('http') != -1
}

const main = async (body) => {
  try {
    console.log(`Messaging ${body.users.length} users...`)
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

    let successfulMessages = 0
    for (const user of body.users) {
      if (!user || typeof user !== 'object' || !user.phone || typeof user.phone !== 'string') {
        console.log('Skipping invalid user', user)
        continue
      }

      try {
        let msgObj = {
          to: phoneFormatter.format(user.phone, '+1NNNNNNNNNN'),
          messagingServiceSid: process.env.TWILIO_SERVICE_SID,
          statusCallback: 'https://texter-twilio-status.now.sh/',
          body: format(body.message, user),
        }
        if (hasMediaUrl(body)) {
          msgObj.mediaUrl = body.mediaUrl.trim()
        }
        await client.messages.create(msgObj)
        await sleep(100)
        successfulMessages++
      } catch (twilioError) {
        console.log('Twilio Error', twilioError)
      }
    }

    console.log(successfulMessages + ' messages sent successfully.')
  } catch (error) {
    console.log('Unknown Error', error)
  }
}
