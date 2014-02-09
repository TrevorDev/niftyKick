var db = require('./../lib/database');
var Q = require('q');

exports.STATUS = {ACTIVE: 1, DELETED: 0}

exports.create = Q.async(function *(projectID, fileName) {
	var ret = (yield db.query('insert into file (project_id, name, status) VALUES (?, ?, ?)',[projectID, fileName, exports.STATUS.ACTIVE]));
	return ret;
})

exports.getFilesByProject = Q.async(function *(projectID) {
	var ret = (yield db.query('select * from file where project_id = ? and status = ?',[projectID, exports.STATUS.ACTIVE]));
	return ret;
})

exports.find = Q.async(function *(id) {
	var ret = (yield db.query('select * from file where id = ?',[id]));
	return ret;
})

exports.getDownload = Q.async(function *(id) {
	var ret = (yield db.query('select * from file, project, user where file.id = ? and file.project_id=project.id and project.user_id = user.id',[id]));
	return ret;
})