var parse = require('co-body');
var config = require('../lib/config');
var fileSys = require('../lib/fileSys');
var project = require('./../models/project');
var fileM = require('./../models/file');
var path = require('path');
var sessionHelper = require('./../lib/sessionHelper');
var fs = require('co-fs');

var projectsFolder = path.join(config.appRoot, "userFiles/projects");

exports.create = function * () {
  var params = yield parse(this);
  params.folderName = fileSys.makeSingleLevelDir(params.folderName);
  var userFolder = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString());
  var dest = path.join(userFolder, params.folderName);
  var src = path.join(config.tempDir, params.folderName);
  try {
      yield fs.mkdir(userFolder);
  } catch (e) {
      //ignore if users project dir already exists
  }
  yield fs.mkdir(dest);
  yield fileSys.copyFolder(src, dest);
  assets = yield fs.readdir(path.join(dest, "projectAssets"))
  files = yield fs.readdir(dest)
  var displayImage = ""
  if (assets.length >= 0) {
      displayImage = assets[0];
  }
  var proj = yield project.create(sessionHelper.getUserID(this.session), params.type, params.title, params.price, params.info, params.description, params.videoLink, displayImage);
  for(var i = 0;i<files.length;i++) {
      if (files[i] != "projectAssets") {
				fileCreated = (yield fileM.create(proj.insertId, files[i]))
      }
  };
  this.jsonResp(200,{message: "Created"})
}