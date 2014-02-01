var parse = require('co-body');
var config = require('../lib/config');
var fileSys = require('../lib/fileSys');
var path = require('path');
var sessionHelper = require('./../lib/sessionHelper');

var projectsFolder = path.join(config.appRoot, "userFiles/projects");

exports.create = function *() {
	var params = yield parse(this);
	params.folderName = fileSys.makeSingleLevelDir(params.folderName);
	var dest = path.join(projectsFolder, sessionHelper.getUserID(this.session),params.folderName);
	var src = path.join(config.tempDir, params.folderName);
	yield fileSys.copyFolder(src, dest);
}