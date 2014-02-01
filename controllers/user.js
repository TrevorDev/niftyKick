var parse = require('co-body');
var sessionHelper = require('./../lib/sessionHelper');
var user = require('./../models/user');
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
		if(params.email.length > 255 || params.password.length > 45){
			this.jsonResp(400,{message: "Email or Password is too long"})
		}else if(params.password.length < 6){
			this.jsonResp(400,{message: "Password must be longer than 6 characters"})
		}else{
			ret = yield user.create(params.email, params.password)
			sessionHelper.setLoggedIn(this.session,params.email,ret.insertId);
			this.jsonResp(201,{message: "Account created"})
		}
	} catch (err) {
		this.jsonResp(409,{message: "Account already exists"})
	}
}

exports.login = function *() {
	try {
		var params = yield parse(this)
		var valid = yield user.auth(params.email, params.password)
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

//UPLOADING ------------------------------------------------------------------
exports.fileUpload = function *() {
	var tmpdir = path.join(config.tempDir, fileSys.makeSingleLevelDir(this.params.folderName));
	var files = yield upload.fileUpload(this, tmpdir);
  this.jsonResp(200,{message: "Uploaded",files: files});
}

exports.createTempUploadFolder = function *() {
	var folder = dlxlib.uid();
	var tmpdir = path.join(config.tempDir, folder);
	yield fs.mkdir(tmpdir);
  this.jsonResp(201,{message: "Created", folderName: folder})
}

exports.deleteTempFile = function *() {
	var params = yield parse(this);
	yield fs.unlink(path.join(config.tempDir, fileSys.makeSingleLevelDir(params.folder),fileSys.makeSingleLevelDir(params.fileName)));
	this.jsonResp(200,{message: "Deleted"});
}