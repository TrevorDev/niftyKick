var db = require('./../lib/database');
var Q = require('q');

exports.create = Q.async(function *(userID, type, title, price, info, description,videoLink, displayImage, status) {
	var ret = (yield db.query('insert into project (user_id, type, title, price, info, description,video_link,display_image, status) VALUES (?, ?, ?, ?, ?, ?,?,?,?)',[userID, type, title, price, info, description,videoLink,displayImage,status]));
	return ret;
})

exports.find = Q.async(function *(id) {
	var ret = (yield db.query('select * from project where id = ?',[id]));
	return ret;
})

exports.getImage = Q.async(function *(id) {
	var ret = (yield db.query('select user_id, display_image from project where id = ?',[id]));
	return ret;
})

exports.STATUS = {CREATING: 0, ACTIVE: 1, DELETED: 2}