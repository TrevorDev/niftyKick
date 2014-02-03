var parse = require('co-body');
var config = require('../lib/config');
var fileSys = require('../lib/fileSys');
var project = require('./../models/project');
var fileM = require('./../models/file');
var path = require('path');
var sessionHelper = require('./../lib/sessionHelper');
var fs = require('co-fs');
var render = require('./../lib/render');
var send = require('koa-send');

var projectsFolder = path.join(config.appRoot, "userFiles/projects");

exports.create = function * () {
  var params = yield parse(this);
  params.folderName = fileSys.makeSingleLevelDir(params.folderName);

  //create the project
  var src = path.join(config.tempDir, params.folderName);
  assets = yield fs.readdir(path.join(src, "projectAssets"))
  var displayImage = ""
  if (assets.length >= 0) {
      displayImage = assets[0];
  }
  var proj = yield project.create(sessionHelper.getUserID(this.session), params.type, params.title, params.price, params.info, params.description, params.videoLink, displayImage);

  //copy temp file to user folder
  var userFolder = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString());
  var dest = path.join(userFolder, proj.insertId.toString());
  try {
      yield fs.mkdir(userFolder);
  } catch (e) {
      //ignore if users project dir already exists
  }
  yield fs.mkdir(dest);
  yield fileSys.copyFolder(src, dest);
  files = yield fs.readdir(dest)
  for(var i = 0;i<files.length;i++) {
      if (files[i] != "projectAssets") {
				fileCreated = (yield fileM.create(proj.insertId, files[i]))
      }
  };

  this.jsonResp(200,{message: "Created",id: proj.insertId})
}

exports.getImage = function * () {
  var ret = yield project.getImage(this.params.id);
  if(ret.length>=1){
    f = path.join(config.appRoot,"userFiles","projects",ret[0].user_id.toString(),this.params.id.toString(),"projectAssets",ret[0].display_image);
    yield send(this, f)
  }else{
    console.log(ret)
  }
}

exports.show = function * () {
  proj = yield project.find(this.params.id);
  if(proj.length <= 0){
    this.redirect('/');
  }else{
    template = sessionHelper.commonTemplate(this.session);
    template.project = proj[0];
    this.body = yield render('project', template);
  }
}