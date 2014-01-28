var db = require('./../lib/database');
var mysql  = require('mysql');
var Q = require('q');

exports.create = Q.async(function *(email, password) {
	var ret = (yield db.query('insert into user (email, password) VALUES (?, ?)',[email, password]));
	return ret;
})