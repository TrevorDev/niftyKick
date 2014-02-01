var db = require('./../lib/database');
var crypto = require('./../lib/crypto');
var Q = require('q');

exports.create = Q.async(function *(email, password) {
	var cryptedPass = yield crypto.crypt(password)
	var ret = (yield db.query('insert into user (email, password) VALUES (?, ?)',[email, cryptedPass]));
	return ret;
})

exports.auth = Q.async(function *(email, password) {
	var ret = (yield db.query('select password, id from user where email = ?',[email]));
	var valid = yield crypto.compareStringHash(password, ret[0].password)
	if(valid){
		return ret[0].id;
	}else{
		return 0;
	}
})