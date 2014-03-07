var Promise = require("bluebird");
var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var File = sequelize.define('File', 
	{
		name: Sequelize.STRING,
		status: Sequelize.INTEGER
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  }
	}
)

File.STATUS = {CREATING: 0, ACTIVE: 1, DELETED: 2}
module.exports = File;