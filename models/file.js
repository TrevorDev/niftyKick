var db = require('./../lib/database');
var Q = require('q');

exports.STATUS = {ACTIVE: 1, DELETED: 0}

exports.create = Q.async(function *(projectID, fileName) {
	var ret = (yield db.query('insert into file (project_id, file_name, status) VALUES (?, ?, ?)',[projectID, fileName, exports.STATUS.ACTIVE]));
	return ret;
})