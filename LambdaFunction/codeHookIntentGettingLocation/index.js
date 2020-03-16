const https = require('https');
const querystring = require('querystring');
const hostGoogleMap = 'maps.googleapis.com';
const pathGoogleMap = '/maps/api/geocode/json';
const GoogleAPIKey = process.env.GOOGLE_API_KEY;
let cityGoogleResult;
let geometryLocation;

// Helpers
function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

function confirmIntent(sessionAttributes, intentName, slots, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ConfirmIntent',
            intentName,
            slots,
            message
        },
    };
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
            responseCard,
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

function connectHttps(method,params,hostname,pathUrl, callback) {
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

function getResultAddress(placePrediction){
    let prediction = '', i = 0;
    placePrediction.address_components.some(function(place){
        console.log(place.long_name);
        if(isNaN(place.long_name)) {
            prediction += place.long_name;
            if(i==0) prediction +=', ';
            if(i==1) return true;
            i++;
        }
   });
   return prediction;
}

function validateSlotCityAddress(place,callback){
    const params={address:place,key:GoogleAPIKey};
    connectHttps('GET',params,hostGoogleMap,pathGoogleMap,(response)=>{
        const res=JSON.parse(response.body);
        if(res.status=="OK") {
            const placePrediction = res.results[0];
            console.log(JSON.stringify(res));
            geometryLocation = res.results[0].geometry.location;
            cityGoogleResult=getResultAddress(res.results[0]);
            console.log(placePrediction);
            console.log("userInput",place.toUpperCase());
            console.log("google",cityGoogleResult.toUpperCase());
            if(cityGoogleResult.toUpperCase()==place.toUpperCase()) {
                 callback("yes");
            }
            else {
                 callback("confirm"); 
            }
        } else {
             callback("notfound");
        }
    });
}

function dispatch(intentRequest,callback){
    const source = intentRequest.invocationSource;
    const outputSessionAttributes = intentRequest.sessionAttributes || {};
    const currentSlot=intentRequest.currentIntent.slots;
    if (source === 'DialogCodeHook') {
            const slot=(intentRequest.recentIntentSummaryView==undefined || intentRequest.recentIntentSummaryView==null || intentRequest.recentIntentSummaryView.length==0)?null:intentRequest.recentIntentSummaryView[0].slotToElicit;
            if(intentRequest.currentIntent.confirmationStatus=="Confirmed") {
                outputSessionAttributes.slots=JSON.stringify(currentSlot);
                return callback(delegate(outputSessionAttributes,intentRequest.currentIntent.slots));
            }
            if(intentRequest.currentIntent.confirmationStatus=="Denied"){
                console.log(intentRequest.currentIntent.slotDetails);
                return callback(elicitSlot(outputSessionAttributes,intentRequest.currentIntent.name,
                    currentSlot,outputSessionAttributes.slotToElicit,{contentType:"PlainText",content:"Could you please type more spesific place?" }));
            }
            if(slot=="deliveryPlace"){
                const place=intentRequest.inputTranscript;
                validateSlotCityAddress(place,(validate)=>{
                    console.log('is '+validate);
                    if(validate=="yes") {
                        outputSessionAttributes['pinLocationGeometry']=JSON.stringify(geometryLocation);
                        return callback(delegate(outputSessionAttributes,intentRequest.currentIntent.slots));
                    } else if(validate=="confirm"){
                        currentSlot[slot]=cityGoogleResult;
                        outputSessionAttributes['pinLocationGeometry']=JSON.stringify(geometryLocation);
                        return callback(confirmIntent(outputSessionAttributes,intentRequest.currentIntent.name,
                            currentSlot,{contentType:"PlainText",content:`Do you mean ${cityGoogleResult}?` }));
                    }
                    else if(validate=="notfound"){
                        console.log("rst elicitSlot");
                        return callback(elicitSlot(outputSessionAttributes,intentRequest.currentIntent.name,
                            currentSlot,slot,{contentType:"PlainText",content:`Sorry, We couldn't find ${place}, please try another one?` }));
                    }
                });
            } 
            else if(slot=="pinLocation"){
                let slots=intentRequest.currentIntent.slots;
                slots['pinLocation']=intentRequest.inputTranscript;
                callback(delegate(outputSessionAttributes,slots));
            }
            else callback(delegate(outputSessionAttributes,intentRequest.currentIntent.slots));
    }
}

exports.handler = (event, context, callback) => {
    // TODO implement
    console.log(event);
    dispatch(event,(response)=>{
        console.log("response ",response);
        callback(null, response);
    });
};
