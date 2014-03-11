var Promise = require("bluebird");
var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var STATUS = {CREATING: "creating", ACTIVE: "active", DELETED: "deleted"}

var File = sequelize.define('File', 
	{
		name: Sequelize.STRING,
		status: {
	    type:   Sequelize.ENUM,
	    values: [STATUS.CREATING, STATUS.ACTIVE, STATUS.DELETED]
	  }
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  }
	}
)

File.STATUS = STATUS
module.exports = File;