var db = require('./../lib/database');
var crypto = require('./../lib/crypto');
var Q = require('q');

exports.create = Q.async(function *(userID, projectID, pricePaid) {
	var ret = (yield db.query('insert into purchase (user_id, project_id, price_paid) VALUES (?, ?, ?)',[userID, projectID, pricePaid]));
	return ret;
})

exports.getUserPurchase = Q.async(function *(userID, projectID) {
	var ret = (yield db.query('select * from purchase  where user_id = ? and project_id = ?',[userID, projectID]));
	return ret[0];
})