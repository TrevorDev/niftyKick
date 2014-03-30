var Promise = require("bluebird");
var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var config = require('./../lib/config');
var path = require('path');
var fs = require('co-fs');

var File = require("./file")
var Purchase = require("./purchase")
var User = require("./user")

var DISPLAY_IMAGE = "displayImage.jpg";

var STATUS = {CREATING: "creating", ACTIVE: "active", DELETED: "deleted"}

var Project = sequelize.define('Project', 
	{
		title: {
	  	type:Sequelize.STRING,
	  	unique: true
	  },
		type: Sequelize.STRING,
		price: Sequelize.FLOAT,
		info: Sequelize.STRING,
		description: Sequelize.STRING,
		videoLink: Sequelize.STRING,
		displayImage: Sequelize.INTEGER,
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

Project.hasMany(File)
Project.hasMany(Purchase)



Project.STATUS = STATUS
Project.DISPLAY_IMAGE = DISPLAY_IMAGE
module.exports = Project;
