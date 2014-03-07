var parse = require('co-body');
var config = require('../lib/config');
var fileSys = require('../lib/fileSys');
var Project = require('./../models/project');
var User = require('./../models/user');
var File = require('./../models/file');
var path = require('path');
var sessionHelper = require('./../lib/sessionHelper');
var fs = require('co-fs');
var render = require('./../lib/render');
var payment = require('./../lib/payment');
var send = require('koa-send');
var upload = require('./../lib/upload');
var Q = require('q');

var projectsFolder = path.join(config.appRoot, "userFiles/projects");
var projectsAssetsFolder = "projectAssets";
var projectsFilesFolder = "files";

//UPLOADING ------------------------------------------------------------------
exports.createEmptyProject = function *() {
  if(sessionHelper.isLoggedIn(this.session)){
    var user = yield User.find(sessionHelper.getUserID(this.session));
    var project = yield Project.create({status: Project.STATUS.CREATING});
    yield user.addProject(project);
    yield project.createFileFolders();
    this.jsonResp(201,{message: "Created", id: project.id})
  }else{
    this.jsonResp(401,{message: "Please authenticate"})
  }
}

exports.fileUpload = function *() {
  if(sessionHelper.isLoggedIn(this.session)){
    var project = yield Project.find(this.params.id)
    var files = yield upload.fileUpload(this, project.getFilesFolder());
    this.jsonResp(200,{message: "Uploaded",files: files});
  }else{
    this.jsonResp(401,{message: "Please authenticate"})
  }
}

exports.projectImageUpload = function *() {
  var project = yield Project.find(this.params.id)
  var files = yield upload.fileUpload(this, project.getAssetsFolder(),Project.DISPLAY_IMAGE);
  this.jsonResp(200,{message: "Uploaded",files: files});
}

exports.deleteTempFile = function *() {
  var params = yield parse(this);
  var project = yield Project.find(this.params.id)
  var filePath = "";
  if(params.projectImage){
    console.log(project.getAssetsFolder())
    console.log(Project.DISPLAY_IMAGE)
    filePath = path.join(project.getAssetsFolder(), Project.DISPLAY_IMAGE)
  }else{
    filePath = path.join(project.getFilesFolder(), fileSys.makeSingleLevelDir(params.fileName));
  }
  yield fs.unlink(filePath);
  this.jsonResp(200,{message: "Deleted"});
}

exports.create = function * () {
  var params = yield parse(this);
  var project = yield Project.find(this.params.id)
  var assets = yield fs.readdir(project.getAssetsFolder())
  var displayImage = ""
  if (assets.length >= 0) {
      displayImage = assets[0];
  }
  var files = yield fs.readdir(project.getFilesFolder())
  for(var i = 0;i<files.length;i++) {
		fileCreated = yield File.create({name: files[i], status: File.STATUS.ACTIVE})
    yield project.addFile(fileCreated);
  };
  yield project.updateAttributes({type: params.type, title: params.title, price: params.price, info: params.info, description: params.description, video_link: params.videoLink, display_image: displayImage, status: Project.STATUS.ACTIVE});
  this.jsonResp(200,{message: "Created", id: this.params.id})
}

exports.purchase = function * () {
  var params = yield parse(this);
  try{
    var project = yield Project.find(this.params.id);
    var amountPaid = project.price*100;
    var paid = yield payment.charge(params.token.id, amountPaid)
    var user = yield User.find(sessionHelper.getUserID(this.session));
    yield user.purchaseProject(project);
    this.jsonResp(200,{message: "Payment success"})
  }catch(err){
    console.log(err)
    this.jsonResp(400,{message: "An error occured, card not charged"})
  }
}

exports.getImage = function * () {
  var project = yield Project.find(this.params.id);
  if(project!=null){
    f = path.join(project.getAssetsFolder(),project.display_image)
    yield send(this, f)
  }else{
    this.jsonResp(404,{message: "Image not found"})
  }
}

exports.show = function * () {
  var project = yield Project.find(this.params.id);
  var files = yield project.getFiles();
  if(project == null){
    this.redirect('/');
  }else{
    template = sessionHelper.commonTemplate(this.session);
    template.project = project;
    template.files = files;
    template.public_stripe_api_key = config.public_stripe_api_key
    if(sessionHelper.isLoggedIn(this.session)){
      var user = yield User.find(sessionHelper.getUserID(this.session))
      var owned = yield user.getPurchases({where: {ProjectID: this.params.id}});
      if(owned.length > 0){
        template.owned = true;
      }
    }
    
    this.body = yield render('project', template);
  }
}