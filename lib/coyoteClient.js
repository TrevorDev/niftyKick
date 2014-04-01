var request = require('request');
var thunkify = require('thunkify');
var config = require('./config')
var post = thunkify(request.post);

exports.createAccount = function(){
	request.post(config.coyoteAccount.URL+"account/create?masterSecret="+config.coyoteOptions.masterSecret+"&name="+config.coyoteAccount.name+"&token="+config.coyoteAccount.token)
}

exports.requestDownloadToken = function *(fileID, requestID, expireIn){
	var resp = yield post(config.coyoteAccount.URL+"file/"+fileID+"/requestToken?account="+config.coyoteAccount.name+"&token="+config.coyoteAccount.token+"&requestID="+requestID+"&expireIn="+expireIn)
	return JSON.parse(resp[0].body).data.requestToken
}

exports.destroyAll = function(){
	request.post(config.coyoteAccount.URL+"destroyAll?masterSecret="+config.coyoteOptions.masterSecret)
}