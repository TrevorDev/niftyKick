var Promise = require("bluebird");
var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var Purchase = sequelize.define('Purchase', 
	{
		price_paid: Sequelize.FLOAT
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  }
	}
)

module.exports = Purchase;