var views = require('co-views');
var sessionHelper = require('./../lib/sessionHelper');

module.exports = views(__dirname + '/../views', {
  map: { html: 'swig' }
});