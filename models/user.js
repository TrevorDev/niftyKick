var crypto = require('./../lib/crypto');
var Promise = require("bluebird");
var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var Project = require("./project")
var Purchase = require("./purchase")
var Payout = require("./payout")

var User = sequelize.define('User', 
	{
	  email: {
	  	type:Sequelize.STRING,
	  	validate: {
	  		isEmail: true
	  	},
	  	unique: true
	  },
	  password: Sequelize.STRING,
	  firstName: Sequelize.STRING,
	  lastName: Sequelize.STRING,
	  bankToken: Sequelize.STRING,
	  phone: Sequelize.STRING,
	  address: Sequelize.STRING
	}, {
		classMethods: {
    	createEncrypted: function*(attributes){ 
    		return yield User.create({
								  email: attributes.email,
								  password: yield crypto.crypt(attributes.password)
								})
			},
			authenticate: function*(email, password){
				var user = yield User.find({where: {email: email}});
				if(yield crypto.compareStringHash(password, user.password)){
					return user.id;
				}else{
					return 0;
				}
			}
	  },
	  instanceMethods: {
	  	purchaseProject: function*(project){ 
    		var purchase = yield Purchase.create({pricePaid: project.price})
    		yield this.addPurchase(purchase);
    		yield project.addPurchase(purchase);
    		return purchase;
			},
			getBalance: function*(){
				var result = yield sequelize.query('select COUNT(*) as count, SUM(Purchases.pricePaid) as balance from Purchases where Purchases.ProjectId in (select Projects.id from Users JOIN Projects ON Users.id = Projects.UserId and Users.id = ?)', null, { raw: true }, [this.id])
    		var amount = result[0].balance ? result[0].balance : 0
    		var excludeFees = (amount*0.92) - (0.30*result[0].count)
    		return excludeFees
			},
			getSales: function*(){
				var result = yield sequelize.query('select COUNT(Purchases.id) as sales from Purchases where Purchases.ProjectId in (select Projects.id from Users JOIN Projects ON Users.id = Projects.UserId and Users.id = ?)', null, { raw: true }, [this.id])
    		return result[0].sales;
			}
	  }
	}
)
User.hasMany(Project)
Project.belongsTo(User)
User.hasMany(Purchase)
Purchase.belongsTo(User)
User.hasMany(Payout)
Payout.belongsTo(User)

module.exports = User;