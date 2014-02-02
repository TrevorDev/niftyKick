var db = require('./../lib/database');
var Q = require('q');

exports.create = Q.async(function *(projectID, fileName) {
	var ret = (yield db.query('insert into file (project_id, file_name) VALUES (?, ?)',[projectID, fileName]));
	return ret;
})