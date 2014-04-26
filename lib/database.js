var Promise = require("bluebird");
var Sequelize = require("sequelize");
var config  = require('./config');

var Sequelize = require("sequelize")
var sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
	//logging: false,
	host: config.database.host
})

exports.getSequelize = function(){
	return Sequelize;
}

exports.getSequelizeInstance = function(){
	return sequelize;
}

function heartBeat() {
	sequelize.query('SELECT 1')
	setTimeout(heartBeat, 300000) //5 min
}

heartBeat()