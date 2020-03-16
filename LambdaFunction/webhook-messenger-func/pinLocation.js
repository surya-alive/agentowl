module.exports = {
  handle: function (FACEBOOK_GRAPH,SEND_MESSAGE_URI,URI_PIN_LOCATION,user,responseLex,callback) {
    const awsdynamodb = require('./aws-dynamodb.js');
    const table = 'LexContexts';
    awsdynamodb.update(table,{user_id:user.id},"set slots = :slots,slotToElicit = :slotToElicit, pinLocationSession = :pinLocationSession ",{":slots":responseLex.slots,":slotToElicit":responseLex.slotToElicit,":pinLocationSession":responseLex.sessionAttributes.msgId},(err,data)=>{
        if(err) console.log("Unable to update LexContexts PinLocation. Error:", JSON.stringify(err, null, 2));
        else {
          const helper = require('./helpers');
          const payload={
              "messaging_type": "RESPONSE",
              "recipient": {"id": user.id},"message": {
                "attachment":{
                "type":"template",
                "payload":{
                  "template_type":"button",
                  "text":responseLex.message,
                  "buttons":[
                    {
                      "type":"web_url",
                      "url":URI_PIN_LOCATION+'?key='+responseLex.sessionAttributes.msgId+'&userid='+user.id,
                      "title":"Click Here",
                      "webview_height_ratio": "TALL",
                      "messenger_extensions": true
                    }
                  ]
                }
              }
          }};
          helper.connectHttps('POST',JSON.stringify(payload),FACEBOOK_GRAPH,SEND_MESSAGE_URI,response=>{
              console.log(response);
          });
        }
    });
  }
};