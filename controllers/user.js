var parse = require('co-body');
var sessionHelper = require('./../lib/sessionHelper');
var User = require('./../models/user');
var upload = require('./../lib/upload');
var dlxlib = require('./../lib/dlxlib');
var config = require('./../lib/config');
var fileSys = require('../lib/fileSys');
var path = require('path');
var fs = require('co-fs');
var os = require('os');
var multiParse = require('co-busboy')


exports.createAccount = function *() {
	try {
		var params = yield parse(this)
		if(params.email.length > 255 || params.password.length > 255){
			this.jsonResp(400,{message: "Email or Password is too long"})
		}else if(params.password.length < 6){
			this.jsonResp(400,{message: "Password must be longer than 6 characters"})
		}else{
			var user = yield User.createEncrypted({email: params.email, password: params.password})
			sessionHelper.setLoggedIn(this.session,params.email,user.id);
			this.jsonResp(201,{message: "Account created"})
		}
	} catch (err) {
		console.log(err)
		this.jsonResp(409,{message: "Account already exists"})
	}
}

exports.login = function *() {
	try {
		var params = yield parse(this)
		var valid = yield User.authenticate(params.email, params.password)
		if (!valid) {
			this.jsonResp(400,{message: "Invalid username/password"})
		}else{
			sessionHelper.setLoggedIn(this.session,params.email,valid);
			this.jsonResp(200,{message: "Logged in"})
		}
	} catch (err) {
		console.log(err)
		this.jsonResp(400,{message: "Invalid username/password"})
	}
}

exports.getFinancialData = function *() {
	var userID = sessionHelper.getUserID(this.session)
	if(userID == null){
		this.jsonResp(401,{message: "Not authenticated"})
		return
	}
	var user = yield User.find(userID)
	var balance = yield user.getBalance()
	var sales = yield user.getSales()
	this.jsonResp(200,{balance: balance, sales: sales})
}