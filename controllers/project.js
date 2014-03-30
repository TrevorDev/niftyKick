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

//UPLOADING ------------------------------------------------------------------
exports.create = function * () {
  var user = yield User.find(sessionHelper.getUserID(this.session));
  var project = null
  var params = yield parse(this);
  try{
    project = yield Project.create({
      type: params.type,
      title: params.title,
      price: params.price,
      info: params.info,
      description: params.description,
      videoLink: params.videoLink,
      displayImage: params.displayImageID,
      status: Project.STATUS.ACTIVE});
  }catch(e){
    console.log(e)
    this.jsonResp(400,{message: "Project with that name already exists"})
    return
  }
  yield user.addProject(project);

  var files = JSON.parse(params.files)
  for(var i = 0;i<files.length;i++) {
		fileCreated = yield File.create({name: files[i].name, fileStoreID: files[i].id, status: File.STATUS.ACTIVE})
    yield project.addFile(fileCreated);
  };
  this.jsonResp(200,{message: "Created", id: project.id})
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
    f = path.join(project.getAssetsFolder(), project.displayImage)
    yield send(this, f)
  }else{
    this.jsonResp(404,{message: "Image not found"})
  }
}

exports.browse = function *(){
  var projects = yield Project.findAll({where: {status: Project.STATUS.ACTIVE}})
  this.jsonResp(200,{projects: projects})
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