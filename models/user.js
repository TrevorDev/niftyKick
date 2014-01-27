var db = require('./../lib/database');
var mysql  = require('mysql');
var conn = db.getConn();

exports.create = function(email, password) {
	conn.query('insert into user (email, password) VALUES ('+mysql.escape(email)+','+' '+mysql.escape(password)+')', function(err, result){
		console.log(err)
	})
}