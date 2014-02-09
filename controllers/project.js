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
var projectsAssetsFolder = "projectAssets";
var projectsFilesFolder = "files";

//UPLOADING ------------------------------------------------------------------
exports.createEmptyProject = function *() {
  if(sessionHelper.isLoggedIn(this.session)){
    var proj = yield project.create(sessionHelper.getUserID(this.session), "", "", "0", "", "0", "0", "", project.STATUS.CREATING);
    this.jsonResp(201,{message: "Created", id: proj.insertId.toString()})
  }else{
    this.jsonResp(401,{message: "Please authenticate"})
  }
}

exports.fileUpload = function *() {
  if(sessionHelper.isLoggedIn(this.session)){
    var files = yield upload.fileUpload(this, project.getFilesFolder(this.params.id, sessionHelper.getUserID(this.session)));
    this.jsonResp(200,{message: "Uploaded",files: files});
  }else{
    this.jsonResp(401,{message: "Please authenticate"})
  }
}

exports.projectImageUpload = function *() {
  var files = yield upload.fileUpload(this, project.getAssetsFolder(this.params.id, sessionHelper.getUserID(this.session)),project.DISPLAY_IMAGE);
  this.jsonResp(200,{message: "Uploaded",files: files});
}

exports.deleteTempFile = function *() {
  var params = yield parse(this);
  var filePath = "";
  if(params.projectImage){
    filePath = path.join(project.getAssetsFolder(this.params.id, sessionHelper.getUserID(this.session)), project.DISPLAY_IMAGE)
  }else{
    filePath = path.join(project.getFilesFolder(this.params.id, sessionHelper.getUserID(this.session)), fileSys.makeSingleLevelDir(params.fileName));
  }
  yield fs.unlink(filePath);
  this.jsonResp(200,{message: "Deleted"});
}

exports.create = function * () {
  var params = yield parse(this);
  var assets = yield fs.readdir(project.getAssetsFolder(this.params.id, sessionHelper.getUserID(this.session)))
  var displayImage = ""
  if (assets.length >= 0) {
      displayImage = assets[0];
  }
  var files = yield fs.readdir(project.getFilesFolder(this.params.id, sessionHelper.getUserID(this.session)))
  for(var i = 0;i<files.length;i++) {
		fileCreated = (yield fileM.create(this.params.id, files[i]))
  };
  var proj = yield project.update(this.params.id, sessionHelper.getUserID(this.session), params.type, params.title, params.price, params.info, params.description, params.videoLink, displayImage, project.STATUS.ACTIVE);
  this.jsonResp(200,{message: "Created", id: this.params.id})
}

exports.getImage = function * () {
  var ret = yield project.getImage(this.params.id);
  if(ret.length>=1){
    f = path.join(project.getAssetsFolder(this.params.id, ret[0].user_id.toString()),ret[0].display_image)
    yield send(this, f)
  }else{
    this.jsonResp(404,{message: "Image not found"})
  }
}

exports.show = function * () {
  proj = yield project.find(this.params.id);
  files = yield fileM.getFilesByProject(this.params.id);
  if(proj.length <= 0){
    this.redirect('/');
  }else{
    template = sessionHelper.commonTemplate(this.session);
    template.project = proj[0];
    template.files = files;
    console.log(files)
    this.body = yield render('project', template);
  }
}