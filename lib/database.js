var Promise = require("bluebird");
var Sequelize = require("sequelize");
var config  = require('./config');

var Sequelize = require("sequelize")
var sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host
})

exports.getSequelize = function(){
	return Sequelize;
}

exports.getSequelizeInstance = function(){
	return sequelize;
}