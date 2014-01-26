var db = require('./../lib/database');
var conn = db.getConn();
export.create(email, password) = function {
	conn.query('insert into user (email, password) VALUES (?, ?)',email,password,function(err, result){
		console.log(result)
	})
}