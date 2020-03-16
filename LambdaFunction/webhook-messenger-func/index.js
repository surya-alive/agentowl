const ACCESS_TOKEN = process.env.tokenAgentOwl;
const FACEBOOK_GRAPH = 'graph.facebook.com';
const SEND_MESSAGE_URI = '/v6.0/me/messages?access_token='+ACCESS_TOKEN;
const URI_PIN_LOCATION = process.env.uriPinLocation;
const webhook = require('./webhook');
const helper = require('./helpers');
const pinLocation = require('./pinLocation');
const fb = require('./fb');
const lex = require('./aws-lex');

let eventBody = {};
let user = {};

const processEvent = function(callback){
    if(eventBody.entry[0].messaging[0].message === undefined || eventBody.entry[0].messaging[0].message.text===undefined) {
        const sendTypeOn={"sender_action": "mark_seen","recipient": {"id": eventBody.entry[0].messaging[0].sender.id}};
        helper.connectHttps('POST',JSON.stringify(sendTypeOn),FACEBOOK_GRAPH,SEND_MESSAGE_URI,typeOn=>{
            
        });
        return callback();
    }
    let messageTxt = eventBody.entry[0].messaging[0].message.text; 
    messageTxt=messageTxt.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,'');
    if(messageTxt==''){
        const sendTypeOn={"sender_action": "mark_seen","recipient": {"id": eventBody.entry[0].messaging[0].sender.id}};
        helper.connectHttps('POST',JSON.stringify(sendTypeOn),FACEBOOK_GRAPH,SEND_MESSAGE_URI,typeOn=>{
            
        });
        return callback();
    }
    const senderId = eventBody.entry[0].messaging[0].sender.id;
    const messageId = eventBody.entry[0].messaging[0].message.mid; 
    const sendTypeOn={"sender_action": "typing_on","recipient": {"id": senderId}};
    helper.connectHttps('POST',JSON.stringify(sendTypeOn),FACEBOOK_GRAPH,SEND_MESSAGE_URI,typeOn=>{
        fb.getUser(FACEBOOK_GRAPH,senderId,{fields:'name',access_token:ACCESS_TOKEN},user=>{
            let lexSession = {userId:user.id,userName:user.name,msgId:messageId};
            lex.getResponse(lexSession,messageTxt,(err,responseLex)=>{
                console.log(err);
                console.log(responseLex);
                if(!err){
                    if(responseLex.slotToElicit=='pinLocation'){
                        pinLocation.handle(FACEBOOK_GRAPH,SEND_MESSAGE_URI,URI_PIN_LOCATION,user,responseLex,callback=>{
                            return callback();
                        });
                    } else {
                        fb.msgText(user,responseLex.message,FACEBOOK_GRAPH,SEND_MESSAGE_URI,result=>{
                            if(responseLex.dialogState=='ElicitSlot'){
                                const msgSent = JSON.parse(result.body);
                                if(responseLex.slotToElicit=='route')
                                    responseLex.slotToElicit=null
                                const context={user_id:user.id,message_id:msgSent.message_id,created_at:new Date().getTime(),slotToElicit:responseLex.slotToElicit,active:true};
                                helper.updateLexElicitSlot(context,(err,data)=>{
                                    if(err) console.log("Unable to put LexContexts. Error:", JSON.stringify(err, null, 2));
                                });
                            } else if(responseLex.dialogState=='ConfirmIntent'){
                                helper.updateGeomertyLocation(user,responseLex.sessionAttributes.pinLocationGeometry,(res)=>{
                                    
                                });
                            }
                        });
                    }
                    
                }
            });
        });
    });
    callback();
};

exports.handler = async (event,context, callback) => {
    console.log(JSON.stringify(event,context, callback));
    if(event.httpMethod==='GET' && event.queryStringParameters!=null){
        webhook.verify(event,context, callback);
    }
    if(event.httpMethod==='POST'){
        eventBody=JSON.parse(event.body);
        processEvent(result=>{
            console.log(true);
            callback(null,helper.generateResponse('EVENT_RECEIVED'));
        });
    }
    else  callback(null,helper.generateResponse({response:'forbidden'},403));
};