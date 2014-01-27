var render = require('./lib/render');
var config = require('./lib/config');
var userM = require('./models/user');
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

app.post('/api/createAccount', createAccount);

function *index() {
	this.body = yield render('index', { title: "Nifty Kick" });
}

function *login() {
	this.body = yield render('login');
}

function *createAccount() {
	var params = yield parse(this)
	userM.create(params.email, params.password)
}

app.listen(3006);
console.log('Started ----------------------------------------------');