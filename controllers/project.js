var parse = require('co-body');

exports.create = function *() {
	var params = yield parse(this);
	console.log(params);
}