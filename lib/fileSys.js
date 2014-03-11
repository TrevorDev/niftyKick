var ncp = require('ncp').ncp;
ncp.limit = 16;

var Promise = require("bluebird");

exports.copyFolder = function(source, destination) {
	var def = Promise.defer();
	ncp(source, destination, function (err) {
	 if (err) {
	 	console.log(err);
	  def.reject(err);
	 }else{
	 	def.resolve("done");
	 }	 
	});
	return def.promise;
}

exports.makeSingleLevelDir = function(dir) {
	return dir.replace("/","")
}