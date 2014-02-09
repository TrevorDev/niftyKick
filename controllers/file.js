var parse = require('co-body');
var config = require('../lib/config');
var fileSys = require('../lib/fileSys');
var file = require('./../models/file');
var project = require('./../models/project');
var path = require('path');
var sessionHelper = require('./../lib/sessionHelper');
var fs = require('co-fs');
var render = require('./../lib/render');
var send = require('koa-send');
var upload = require('./../lib/upload');


exports.download = function * () {
  var d = yield file.getDownload(this.params.id);
  if(d[0].price==0){
  	var filePath = path.join(project.getFilesFolder(d[0].project_id, d[0].user_id), d[0].name)
    yield send(this, filePath)
    this.set('Content-Disposition', "attachment; filename="+d[0].name);
    this.set('content-type', "application/octet-stream");
  }
}