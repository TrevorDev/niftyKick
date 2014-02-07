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
var upload = require('./../lib/upload');

var projectsFolder = path.join(config.appRoot, "userFiles/projects");

//UPLOADING ------------------------------------------------------------------

exports.createEmptyProject = function *() {
  if(sessionHelper.isLoggedIn(this.session)){
    var proj = yield project.create(sessionHelper.getUserID(this.session), "", "", "0", "", "0", "0", "", project.STATUS.CREATING);
    var userFolder = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString());
    var projFolder = path.join(userFolder,proj.insertId.toString());
    try{
      yield fs.mkdir(userFolder);
    }catch(e){

    }
    yield fs.mkdir(projFolder);
    yield fs.mkdir(path.join(projFolder, "projectAssets"));
    this.jsonResp(201,{message: "Created", id: proj.insertId.toString()})
  }else{
    this.jsonResp(401,{message: "Please authenticate"})
  }
}

exports.fileUpload = function *() {
  if(sessionHelper.isLoggedIn(this.session)){
    var dir = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString(), fileSys.makeSingleLevelDir(this.params.id));
    var files = yield upload.fileUpload(this, dir);
    this.jsonResp(200,{message: "Uploaded",files: files});
  }else{
    this.jsonResp(401,{message: "Please authenticate"})
  }
}

exports.projectImageUpload = function *() {
  var dir = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString(), fileSys.makeSingleLevelDir(this.params.id));
  var files = yield upload.fileUpload(this, path.join(dir, "projectAssets"));
  this.jsonResp(200,{message: "Uploaded",files: files});
}

exports.deleteTempFile = function *() {
  var params = yield parse(this);
  var dir = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString(), fileSys.makeSingleLevelDir(this.params.id));
  if(params.projectImage){
    dir = path.join(dir, "projectAssets");
  }
  var filePath = path.join(dir, fileSys.makeSingleLevelDir(params.fileName));
  yield fs.unlink(filePath);
  this.jsonResp(200,{message: "Deleted"});
}

exports.create = function * () {
  var params = yield parse(this);
  var src = path.join(config.tempDir, fileSys.makeSingleLevelDir(this.params.id));
  var assets = yield fs.readdir(path.join(src, "projectAssets"))
  var displayImage = ""
  if (assets.length >= 0) {
      displayImage = assets[0];
  }
  var userFolder = path.join(projectsFolder, sessionHelper.getUserID(this.session).toString());
  var dest = path.join(userFolder, proj.insertId.toString());
  yield fs.mkdir(dest);
  yield fileSys.copyFolder(src, dest);
  var files = yield fs.readdir(dest)
  for(var i = 0;i<files.length;i++) {
      if (files[i] != "projectAssets") {
				fileCreated = (yield fileM.create(proj.insertId, files[i]))
      }
  };
  var proj = yield project.create(sessionHelper.getUserID(this.session), params.type, params.title, params.price, params.info, params.description, params.videoLink, displayImage, project.STATUS.ACTIVE);
  this.jsonResp(200,{message: "Created", id: proj.insertId})
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