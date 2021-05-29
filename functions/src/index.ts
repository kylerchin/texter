import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
console.log(functions)

var accountSid = functions.config().twilio.accountsid; // Your Account SID from www.twilio.com/console
var authToken = functions.config().twilio.authtoken;   // Your Auth Token from www.twilio.com/console

const client = require('twilio')(accountSid, authToken, {
    lazyLoading: true,
    logLevel: 'debug'
});

const cors = require('cors')({origin: true});

console.log(client)

function sendTextMessage(messageContent: string, recipient: string) {

    client.messages
        .create({
            body:  messageContent,
            messagingServiceSid:  functions.config().twilio.messagingservicesid,
            to: recipient
        })
        .then((message: { sid: any; }) => console.log(message.sid));
}

sendTextMessage("Boo!","+19494699476")

//https://us-central1-kenneth-texter.cloudfunctions.net/callbackTwilioStatus
export const callbackTwilioStatus = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        functions.logger.info(request)
    })
});

//https://us-central1-kenneth-texter.cloudfunctions.net/twilioIncomingMessage
export const twilioIncomingMessage = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        functions.logger.info(request)
    })
});