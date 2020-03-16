module.exports = {
  read: function (table,query,value,callback) {
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
  },
  put:function(table,data,callback) {
    const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName:table,
        Item:data
    };
    docClient.put(params, (err, data)=> {
        callback(err,data);
    });
  },
  readLexContext: function(user_id,callback){
        const AWS = require('aws-sdk');
        const docClient = new AWS.DynamoDB.DocumentClient();
        const params = {
        TableName : 'LexContexts',
        KeyConditionExpression:"user_id = :user_id",
        FilterExpression:"active = :active",
        ExpressionAttributeValues: {":user_id":user_id,":active":true},
        Limit: 10,
        ScanIndexForward: false,
        };
        docClient.query(params, (err, data) =>{
            callback(err,data);
        });
    },
  update:function(table,key,updateExpression,expressionAttributeValues,callback){
    const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName:table,
        Key:key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues:expressionAttributeValues,
        ReturnValues:"UPDATED_NEW"
    };
    docClient.update(params, function(err, data) {
        callback(err, data);
    });
}
};