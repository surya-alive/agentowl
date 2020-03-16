module.exports = {
  generateResponse : function(body, statusCode=200){
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
      };
  },
  updateLexElicitSlot:function(context,callback){
    const awsdynamodb = require('./aws-dynamodb.js');
    const table = 'LexContexts';
    awsdynamodb.read(table,"user_id = :userId",{":userId":context.user_id},(err,data)=>{
        if(!err){
            if(data.Count>0){
              awsdynamodb.update(table,{user_id:context.user_id},"set slotToElicit = :slotToElicit",{":slotToElicit":context.slotToElicit},(err,data)=>{
                if(err) console.log("Unable to update LexContexts. Error:", JSON.stringify(err, null, 2));
                callback();
              });
            } else {
              awsdynamodb.put('LexContexts',context,(err,putContext)=>{
                if(err) console.log("Unable to put LexContexts. Error:", JSON.stringify(err, null, 2));
                callback();
              });
            }
        } else {
           if(err) console.log("Unable to read LexContexts. Error:", JSON.stringify(err, null, 2));
          callback();
        }
    });
  },
  updateGeomertyLocation:function(user,geometry,callback){
    const awsdynamodb = require('./aws-dynamodb.js');
    awsdynamodb.update('LexContexts',{user_id:user.id},"set pinLocationGeometry = :pinLocationGeometry",{":pinLocationGeometry":geometry},(err,data)=>{
      if(err) console.log("Unable to update LexContexts. Error:", JSON.stringify(err, null, 2));
      callback();
    });
  },
  connectHttps: function (method,params,hostname,pathUrl, callback) {
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
    },
    readDDB:function(table,query,value,callback){
      const AWS = require('aws-sdk');
      const docClient = new AWS.DynamoDB.DocumentClient();
      const params = {
          TableName : table,
          KeyConditionExpression: query,
          ExpressionAttributeValues: value
      };
      docClient.query(params, (err, data) =>{
          callback(err,data);
      });
  }
};