var parse = require('co-body');
var user = require('./../models/user');

exports.createAccount = function *() {
	try {
		var params = yield parse(this)
		console.log()
		if(params.email.length > 255 || params.password.length > 45){
			this.jsonResp(400,{message: "Email or Password is too long"})
		}else if(params.password.length < 6){
			this.jsonResp(400,{message: "Password must be longer than 6 characters"})
		}else{
			ret = yield user.create(params.email, params.password)
			this.session.email = params.email;
			this.jsonResp(201,{message: "Account created"})
		}
	} catch (err) {
		this.jsonResp(409,{message: "Account already exists"})
	}
}

exports.login = function *() {
	console.log("hit")
	try {
		var params = yield parse(this)
		var valid = yield user.auth(params.email, params.password)
		if (!valid) {
			this.jsonResp(400,{message: "Invalid username/password"})
		}else{
			this.session.email = params.email;
			this.jsonResp(200,{message: "Logged in"})
		}
	} catch (err) {
		console.log(err)
		this.jsonResp(400,{message: "Invalid username/password"})
	}
}