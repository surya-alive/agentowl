module.exports = {
  getResponse: function (user,inputText, callback) {
    const AWS = require('aws-sdk');
    const awsdynamodb = require('./aws-dynamodb.js');
    const lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28',region:'us-west-2'});
    awsdynamodb.readLexContext(user.userId,(err,lexContext)=>{
      if(err) console.log(JSON.stringify(err));
      else {
        if(lexContext.Count>0){
          if(lexContext.Items[0].slotToElicit!=null) 
            user.slotToElicit=lexContext.Items[0].slotToElicit;
        }
        const params = {
          botAlias: 'prod',
          botName: 'agentOwl', 
          userId: user.userId, 
          inputText:inputText,
          sessionAttributes: user
        };
        lexruntime.postText(params, function(err, data) {
          callback(err, data);
        });
      }
    });
  }
};