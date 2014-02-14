var mysql  = require('mysql');
var config  = require('./config');
var Q = require('q');
var pool
getConn = function(){
	var def = Q.defer();
	if(!pool){
		pool = mysql.createPool({
		  host     : config.host,
		  user     : config.user,
		  password : config.password,
		  database : config.database
		});
	}
	pool.getConnection(function(err, connection) {
	  if(err) { 
	  	def.reject(err);
	  }else{
	  	def.resolve(connection);
	  }
	});
	return def.promise;
}

exports.query = Q.async(function *(queryString, params){
	var def = Q.defer();
	conn = yield getConn();
	conn.query(queryString,params, function(err, result){
		conn.release();
		if(err){
			def.reject(err);
		}else{
			def.resolve(result);
		}
	})
	return def.promise;
})

var keepAlive = function (){
	exports.query("select * from user where id = 0");
	setTimeout(keepAlive,3000)
}

keepAlive();