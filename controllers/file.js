var parse = require('co-body')
var config = require('../lib/config')
var fileSys = require('../lib/fileSys')
var File = require('./../models/file')
var Project = require('./../models/project')
var User = require('./../models/user')
var path = require('path')
var sessionHelper = require('./../lib/sessionHelper')
var fs = require('co-fs')
var render = require('./../lib/render')
var send = require('koa-send')
var upload = require('./../lib/upload')
var coyoteClient = require('./../lib/coyoteClient')

exports.requestDownload = function * () {
  var file = yield File.find(this.params.id)
  var accessAllowed = false
  if(file.price==0){
  	accessAllowed = true
  }else{
    var user = yield User.find(sessionHelper.getUserID(this.session))
  	var owned = yield user.getPurchases({where: {ProjectId: file.ProjectId}})
  	if(owned){
  		accessAllowed = true
    }
  }
  if(!accessAllowed){
   this.jsonResp(403,{message: "you dont have permission for this file"}) 
   return
  }
  var project = yield Project.find(file.ProjectId)
  var token = yield coyoteClient.requestDownloadToken(file.fileStoreID, user.email.replace(/@/g, "_at_").replace(/\./g, "_dot_"), 30000)
	this.jsonResp(200,{token: token, fileStoreID: file.fileStoreID, fileName: file.name})
}