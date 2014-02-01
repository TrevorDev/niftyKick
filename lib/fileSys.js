var ncp = require('ncp').ncp;
ncp.limit = 16;

var Q = require('q');

exports.copyFolder = function(source, destination) {
	var def = Q.defer();
	ncp(source, destination, function (err) {
	 if (err) {
	  def.reject(err);
	 }else{
	 	def.resolve("done");
	 }	 
	});
	return def.promise;
}

exports.makeSingleLevelDir = function(dir) {
	return dir.replace("/","").replace(".","")
}