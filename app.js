var render = require('./lib/render');
var config = require('./lib/config');
var db = require('./lib/database');
var jsonResp = require('./lib/jsonResp');
var logger = require('koa-logger');
var router = require('koa-router');
var serve = require('koa-static');
var session = require('koa-session');
var views = require('co-views');
var parse = require('co-body');
var koa = require('koa');
var swig = require('swig');
var app = koa();

var user = require('./controllers/user');

//REMOVE IN PRODUCTION??
swig.setDefaults({ cache: false })

//ROUTES
app.keys = [config.sessionSecret];
app.use(session());
app.use(jsonResp());
app.use(router(app));
app.get('/', index);
app.get('/login', login);
app.get('/public/*', serve('.'));

app.post('/api/createAccount', user.createAccount);

function *index() {
	this.body = yield render('index', { title: "Nifty Kick" });
}

function *login() {
	this.body = yield render('login');
}

app.listen(3006);
console.log('Started ----------------------------------------------');