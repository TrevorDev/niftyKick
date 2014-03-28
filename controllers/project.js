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
  var project = yield Project.create({status: Project.STATUS.ACTIVE});
  yield user.addProject(project);

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
  yield project.updateAttributes({type: params.type, title: params.title, price: params.price, info: params.info, description: params.description, videoLink: params.videoLink, displayImage: displayImage, status: Project.STATUS.ACTIVE});
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
    f = path.join(project.getAssetsFolder(), project.displayImage)
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