var parse = require('co-body')
var config = require('../lib/config')
var fileSys = require('../lib/fileSys')
var Project = require('./../models/project')
var User = require('./../models/user')
var File = require('./../models/file')
var path = require('path')
var sessionHelper = require('./../lib/sessionHelper')
var fs = require('co-fs')
var render = require('./../lib/render')
var payment = require('./../lib/payment')
var send = require('koa-send')
var upload = require('./../lib/upload')

//UPLOADING ------------------------------------------------------------------
exports.create = function * () {
  var user = yield User.find(sessionHelper.getUserID(this.session))
  var project = null
  var params = yield parse(this)
  try{
    project = yield Project.create({
      type: params.type,
      title: params.title,
      price: params.price,
      info: params.info,
      description: params.description,
      videoLink: params.videoLink,
      displayImage: params.displayImageID,
      status: Project.STATUS.ACTIVE})
  }catch(e){
    console.log(e)
    this.jsonResp(400,{message: "Project with that name already exists"})
    return
  }
  yield user.addProject(project)

  var files = JSON.parse(params.files)
  for(var i = 0;i<files.length;i++) {
		fileCreated = yield File.create({name: files[i].name, fileStoreID: files[i].id, status: File.STATUS.ACTIVE})
    yield project.addFile(fileCreated)
  }
  this.jsonResp(200,{message: "Created", id: project.id})
}

exports.purchase = function * () {
  var params = yield parse(this)
  try{
    var project = yield Project.find(this.params.id)
    var amountPaid = project.price*100
    var paid = yield payment.charge(params.token.id, amountPaid, "Purchase project: "+project.title)
    var user = yield User.find(sessionHelper.getUserID(this.session))
    yield user.purchaseProject(project)
    this.jsonResp(200,{message: "Payment success"})
  }catch(err){
    console.log(err)
    this.jsonResp(400,{message: "An error occured, card not charged"})
  }
}

exports.getImage = function * () {
  var project = yield Project.find(this.params.id)
  if(project!=null){
    f = path.join(project.getAssetsFolder(), project.displayImage)
    yield send(this, f)
  }else{
    this.jsonResp(404,{message: "Image not found"})
  }
}

exports.browse = function *(){
  scope = {}
  scope.where = {status: Project.STATUS.ACTIVE}
  if(this.query.userID){
    scope.where.UserID = this.query.userID
  }
  var projects = yield Project.findAll(scope)
  this.jsonResp(200,{projects: projects})
}

exports.getProject = function * () {
  var project = yield Project.find({where:{id: this.params.id, status: Project.STATUS.ACTIVE}})
  var files = yield project.getFiles()
  if(project == null){
    this.jsonResp(404,{message: "Project not found"})
    return
  }else{
    var displayProject = {}
    
    displayProject.price = project.price
    displayProject.type = project.type
    displayProject.title = project.title
    displayProject.description = project.description
    displayProject.displayImage = project.displayImage
    displayProject.info = project.info
    displayProject.videoLink = project.videoLink
    displayProject.id = project.id

    displayProject.files = files
    displayProject.owned = false
    if(sessionHelper.isLoggedIn(this.session)){
      var user = yield User.find(sessionHelper.getUserID(this.session))
      var owned = yield user.getPurchases({where: {ProjectID: this.params.id}})
      if(owned.length > 0){
        displayProject.owned = true
      }
    }
    this.jsonResp(200,{project: displayProject})
  }
}