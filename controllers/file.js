var parse = require('co-body');
var config = require('../lib/config');
var fileSys = require('../lib/fileSys');
var File = require('./../models/file');
var Project = require('./../models/project');
var User = require('./../models/user');
var path = require('path');
var sessionHelper = require('./../lib/sessionHelper');
var fs = require('co-fs');
var render = require('./../lib/render');
var send = require('koa-send');
var upload = require('./../lib/upload');


exports.download = function * () {
  var d = yield File.find(this.params.id);
  var accessAllowed = false;
  if(d.price==0){
  	accessAllowed = true;
  }else{
    var user = yield User.find(sessionHelper.getUserID(this.session));
  	var owned = yield user.getPurchases({where: {ProjectId: d.ProjectId}});
  	if(owned){
  		accessAllowed = true;
    }
  }

  if(accessAllowed){
    var project = yield Project.find(d.ProjectId);
  	var filePath = path.join(project.getFilesFolder(), d.name)
	  yield send(this, filePath)
	  this.set('Content-Disposition', "attachment; filename="+d.name);
	  this.set('content-type', "application/octet-stream");
  }
}