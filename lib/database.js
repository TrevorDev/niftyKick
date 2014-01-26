var mysql  = require('mysql');
var config  = require('./config');
var conn
exports.getConn = function(){
	if(!conn){
		conn = mysql.createConnection({
		  host     : config.host,
		  user     : config.user,
		  password : config.password,
		  database : config.database
		});
	}
	return conn
}