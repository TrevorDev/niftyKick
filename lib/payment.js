var config = require('../lib/config');
var stripe = require('stripe')(config.private_stripe_api_key);
var Promise = require("bluebird");


exports.charge = function (token, price){
	var def = Promise.defer();
	stripe.charges.create({
    amount: price,
    currency: 'cad',
    card: token
  }, function(err, charge) {
      if (err) {
      		def.reject(err);
      } else {
          def.resolve(charge);
      }
  });
  return def.promise;
}