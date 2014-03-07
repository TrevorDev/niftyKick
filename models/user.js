var crypto = require('./../lib/crypto');
var Promise = require("bluebird");
var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var Project = require("./project")
var Purchase = require("./purchase")

var User = sequelize.define('User', 
	{
	  email: {
	  	type:Sequelize.STRING,
	  	validate: {
	  		isEmail: true
	  	},
	  	unique: true
	  },
	  password: Sequelize.STRING
	}, {
		classMethods: {
    	createEncrypted: Promise.coroutine(function*(attributes){ 
    		return yield User.create({
								  email: attributes.email,
								  password: yield crypto.crypt(attributes.password)
								})
			}),
			authenticate: Promise.coroutine(function*(email, password){
				var user = yield User.find({where: {email: email}});
				if(yield crypto.compareStringHash(password, user.password)){
					return user.id;
				}else{
					return 0;
				}
			})
	  },
	  instanceMethods: {
	  	purchaseProject: Promise.coroutine(function*(project){ 
    		var purchase = yield Purchase.create({price_paid: project.price})
    		yield this.addPurchase(purchase);
    		yield project.addPurchase(purchase);
    		return purchase;
			})
	  }
	}
)
User.hasMany(Project)
Project.belongsTo(User)
User.hasMany(Purchase)
Purchase.belongsTo(User)

module.exports = User;