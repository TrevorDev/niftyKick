var mysql  = require('mysql');
var config  = require('./config');
var Q = require('q');
var conn
getConn = function(){
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

exports.query = function(queryString, params){
	var def = Q.defer();
	conn = getConn();
	conn.query(queryString,params, function(err, result){
		if(err){
			def.reject(err);
		}else{
			def.resolve(result);
		}
	})
	return def.promise;
}