function close(sessionAttributes, fulfillmentState,message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}

function  connectHttps (method,params,hostname,pathUrl, callback) {
    const https = require('https');
    const querystring = require('querystring');
    const options={};
    options.method=method;
    options.hostname=hostname;
    options.path=pathUrl;
    if(method=='POST') options.headers= {
      "Content-Type": "application/json",
      'Content-Length': params.length
    };
    else options.path=pathUrl+'?'+querystring.stringify(params);
    const Req = https.request(options, (res) => {
         const chunks = [];
          res.setEncoding('utf8');
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
              if (callback) {
                  callback({
                      body: chunks.join(''),
                      statusCode: res.statusCode,
                      statusMessage: res.statusMessage,
                  });
              }
          });
          return res;
      });
      if(method=='POST') Req.write(params);
      Req.end();
    }

exports.handler =  (event, context, callback) => {
    console.log(event);
    const ACCESS_TOKEN = process.env.tokenAgentOwl;
    const FACEBOOK_GRAPH = 'graph.facebook.com';
    const SEND_MESSAGE_URI = '/v6.0/me/messages?access_token='+ACCESS_TOKEN;
    const payload={"messaging_type": "RESPONSE","recipient": {"id": event.sessionAttributes.userId},"message": {"text": JSON.stringify(event.currentIntent.slots)}};
    connectHttps('POST',JSON.stringify(payload),FACEBOOK_GRAPH,SEND_MESSAGE_URI,response=>{
        callback(null,close(event.sessionAttributes,'Fulfilled',{contentType:"PlainText",content:"Nice!"}));
    });
};
