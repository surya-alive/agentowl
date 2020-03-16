module.exports = {
   verify: function(event,context, callback) { 
        const VERIFY_WEBHOOK_TOKEN = process.env.tokenVerifyWebhook;
        const helper = require('./helpers');
        let mode = event.queryStringParameters['hub.mode'];
        let token = event.queryStringParameters['hub.verify_token'];
        let challenge = event.queryStringParameters['hub.challenge'];
        if (mode === 'subscribe' && token === VERIFY_WEBHOOK_TOKEN) {
            callback (null,helper.generateResponse(Number(challenge)));
        }
   }
};