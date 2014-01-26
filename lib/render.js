var views = require('co-views');

module.exports = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

exports.public = views(__dirname + '/../public', {
  map: { html: 'swig' }
});