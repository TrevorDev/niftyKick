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
	console.log("query start")
	conn = getConn();
	console.log(conn==null)
	conn.query(queryString,params, function(err, result){
		if(err){
			console.log("err")
			console.log(err)
			def.reject(err);
		}else{
			console.log("resolve")
			def.resolve(result);
		}
	})
	return def.promise;
}