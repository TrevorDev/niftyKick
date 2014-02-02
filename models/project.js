var db = require('./../lib/database');
var Q = require('q');

exports.create = Q.async(function *(userID, type, title, price, info, description,videoLink, displayImage) {
	var ret = (yield db.query('insert into project (user_id, type, title, price, info, description,video_link,display_image) VALUES (?, ?, ?, ?, ?, ?,?,?)',[userID, type, title, price, info, description,videoLink,displayImage]));
	return ret;
})