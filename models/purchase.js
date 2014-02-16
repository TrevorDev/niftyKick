var db = require('./../lib/database');
var crypto = require('./../lib/crypto');
var Q = require('q');

exports.create = Q.async(function *(userID, projectID, pricePaid) {
	var ret = (yield db.query('insert into purchase (user_id, project_id, price_paid) VALUES (?, ?, ?)',[userID, projectID, pricePaid]));
	return ret;
})