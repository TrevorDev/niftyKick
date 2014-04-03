var Database = require('./../lib/database');
var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var STATUS = {REQUESTING: "requesting", APPROVED: "approved", PAID: "paid"}
var TYPE = {CASH: "cash", CHECK: "check", BANK_TRANSFER: "bank transfer"}

var Payout = sequelize.define('Payout', 
	{
		bankToken: Sequelize.STRING,
		amount: Sequelize.FLOAT,
		type: {
	    type:   Sequelize.ENUM,
	    values: [TYPE.CASH, TYPE.CHECK, TYPE.BANK_TRANSFER]
	  },
		status: {
	    type:   Sequelize.ENUM,
	    values: [STATUS.REQUESTING, STATUS.APPROVED, STATUS.PAID]
	  }
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  }
	}
)
Payout.TYPE = TYPE
Payout.STATUS = STATUS
module.exports = Payout;