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

//FOLDER ACCESS STUFF
var ROOT_FOLDER = path.join(config.appRoot, "userFiles/projects");
var ASSETS_FOLDER_NAME = "projectAssets";
var FILES_FOLDER_NAME = "files";
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
		displayImage: Sequelize.STRING,
		status: {
	    type:   Sequelize.ENUM,
	    values: [STATUS.CREATING, STATUS.ACTIVE, STATUS.DELETED]
	  }
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  	createFileFolders: function*(){
	  		try{
			    yield fs.mkdir(this.getUserFolder());
			  }catch(e){}
	  		yield fs.mkdir(this.getProjectFolder());
			  yield fs.mkdir(this.getAssetsFolder());
			  yield fs.mkdir(this.getFilesFolder());
	  	},
	  	getUserFolder: function(){
    		return path.join(ROOT_FOLDER, this.UserId.toString());
			},
	  	getProjectFolder: function(){
    		return path.join(this.getUserFolder(), this.id.toString());
			},
	  	getAssetsFolder: function(){
    		return path.join(this.getProjectFolder(), ASSETS_FOLDER_NAME);
			},
  		getFilesFolder: function(){ 
    		return path.join(this.getProjectFolder(), FILES_FOLDER_NAME);
			}
	  }
	}
)

Project.hasMany(File)
Project.hasMany(Purchase)



Project.STATUS = STATUS
Project.DISPLAY_IMAGE = DISPLAY_IMAGE
module.exports = Project;
