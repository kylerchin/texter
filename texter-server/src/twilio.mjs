import twilio from 'twilio'
import format from 'string-template'
import phoneFormatter from 'phone-formatter'
import request from 'request'
import json2csv from 'json2csv'

export class Twilio {
  constructor() {
    this.client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  }

  async sendMessage(message, recipient) {
    const body = format(message, recipient)

    return this.client.messages.create({
      to: phoneFormatter.format(recipient.phone, '+1NNNNNNNNNN'),
      messagingServiceSid: process.env.TWILIO_SERVICE_SID,
      statusCallback: 'https://texter-server.now.sh/twilio',
      body,
    })
  }

  async getLogs() {
    const parser = new json2csv.Parser({
      fields: [
        {
          value: (row, field) =>
            row.from
              .split('+1')
              .splice(-1, 1)
              .join(''),
          stringify: false,
          label: 'From',
        },
        {
          value: (row, field) =>
            row.to
              .split('+1')
              .splice(-1, 1)
              .join(''),
          stringify: false,
          label: 'To',
        },
        { value: 'body', label: 'Body' },
        { value: 'status', label: 'Status' },
        { value: 'dateSent', label: 'SentDate' },
        { value: 'apiVersion', label: 'ApiVersion' },
        { value: 'numSegments', label: 'NumSegments' },
        { value: 'errorCode', label: 'ErrorCode', default: 0 },
        { value: 'accountSid', label: 'AccountSid' },
        { value: 'sid', label: 'Sid' },
        { value: 'direction', label: 'Direction' },
        { value: 'price', label: 'Price' },
        { value: 'priceUnit', label: 'PriceUnit' },
      ],
    })
    const d = new Date()
    d.setTime(d.getTime() - 86400000 * 7)
    // d.setHours(0, 0, 0, 0)
    const dayBefore = `${d
      .toISOString()
      .split('.')
      .splice(0, 1)
      .join('')}+00:00`

    const l = await this.client.messages.list({ dateSentAfter: dayBefore })
    const csv = parser.parse(l)
    return csv
  }

  // async getLogs() {
  //   return new Promise((resolve, reject) => {

  //     const dayBefore = `${new Date(Date.now() - 86400000 * 2)
  //       .toISOString()
  //       .split('.')
  //       .splice(0, 1)
  //       .join('')}-07:00`
  //       // const l = await this.client.messages.list({ dateSentAfter: dayBefore })
  //       // console.log('l', l.length)
  //       // return 'foo'
  //       request(
  //         {
  //           url: `https://${process.env.TWILIO_SID}:${
  //             process.env.TWILIO_AUTH_TOKEN
  //           }@api.twilio.com/2010-04-01/Accounts/${
  //             process.env.TWILIO_SID
  //           }/Messages.csv?DateSent%3E=${encodeURIComponent(dayBefore)}`,
  //         },
  //         (error, response, body) => {
  //           if (error) {
  //             console.log('ERROR!', error)
  //           }

  //           console.log('body', body)
  //         }
  //       )
  //       return 'foo'
  //     }
  //   })
}
