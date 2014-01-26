var render = require('./lib/render');
var config = require('./lib/config');
var db = require('./lib/database');
var logger = require('koa-logger');
var router = require('koa-router');
var serve = require('koa-static');
var session = require('koa-session');
var views = require('co-views');
var parse = require('co-body');
var koa = require('koa');
var swig = require('swig');
var app = koa();

//REMOVE IN PRODUCTION??
swig.setDefaults({ cache: false })

//ROUTES
app.keys = [config.sessionSecret];
app.use(session());

app.use(router(app));
app.get('/', index);
app.get('/login', login);
app.get('/public/*', serve('.'));

function *index() {
	var conn = db.getConn();
	conn.query('SELECT * from stock_snapshot', function(err, rows, fields) {
  if (err) {
  	console.log(err)
  }
  console.log(rows[0]);
	});
	this.body = yield render('index', { title: "Nifty Kick" });
}

function *login() {
	this.body = yield render('login');
}


app.listen(3006);
console.log('Started ----------------------------------------------');