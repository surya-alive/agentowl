module.exports = {
  msgText: function (userSession,msg,FACEBOOK_GRAPH,SEND_MESSAGE_URI, callback) {
    const helper = require('./helpers');
    const payload={"messaging_type": "RESPONSE","recipient": {"id": userSession.id},"message": {"text": msg}};
    helper.connectHttps('POST',JSON.stringify(payload),FACEBOOK_GRAPH,SEND_MESSAGE_URI,response=>{
        callback(response);
    });
  },
  getUser: function(FACEBOOK_GRAPH,userId,params,callback){
    const helper = require('./helpers');
    const awsdynamodb = require('./aws-dynamodb.js');
    awsdynamodb.read("Users","id = :userId",{":userId":userId},(err,data)=>{
      if (err) {
          console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
          callback(err);
      } else {
          if(data.Count>0){
            callback(data.Items[0]);
          } else {
            helper.connectHttps('GET',params,FACEBOOK_GRAPH,'/'+userId,response=>{
              response=JSON.parse(response.body);
              response.created_at=new Date().getTime();
              awsdynamodb.put('Users',response,(err,data)=>{
                if(err) console.log("Unable to putDDB User. Error:", JSON.stringify(err, null, 2));
                  callback(response);
              });
          });
        }
      }
    });
  },
};