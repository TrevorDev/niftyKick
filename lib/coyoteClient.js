var request = require('request');
var thunkify = require('thunkify');
var config = require('./config')
var post = thunkify(request.post);

exports.createAccount = function(){
	var url = config.coyoteAccount.URL+"account/create?masterSecret="+config.coyoteOptions.masterSecret+"&name="+config.coyoteAccount.name+"&token="+config.coyoteAccount.token
	request.post({url: url, strictSSL: false})
}

exports.requestDownloadToken = function *(fileID, requestID, expireIn){
	var url = config.coyoteAccount.URL+"file/"+fileID+"/requestToken?account="+config.coyoteAccount.name+"&token="+config.coyoteAccount.token+"&requestID="+requestID+"&expireIn="+expireIn
	var resp = yield post({url: url, strictSSL: false})
	return JSON.parse(resp[0].body).data.requestToken
}

exports.destroyAll = function(){
	var url = config.coyoteAccount.URL+"destroyAll?masterSecret="+config.coyoteOptions.masterSecret
	request.post({url: url, strictSSL: false})
}
