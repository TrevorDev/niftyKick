var parse = require('co-body');
var user = require('./../models/user');

exports.createAccount = function *() {
	var params = yield parse(this)
	this.jsonResp()
	try {
		ret = yield user.create(params.email, params.password)
		this.jsonResp(201,{message: "Account Created"})
	} catch (err) {
		this.jsonResp(409,{message: "Account already exists"})
	}
}