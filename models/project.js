var db = require('./../lib/database');
var Q = require('q');

exports.create = Q.async(function *(userID, type, title, price, info, description,videoLink) {
	var ret = (yield db.query('insert into project (user_id, type, title, price, info, description,video_link) VALUES (?, ?, ?, ?, ?, ?,?)',[userID, type, title, price, info, description,videoLink]));
	return ret;
})