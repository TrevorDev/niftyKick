var render = require('./lib/render');
var config = require('./lib/config');
var db = require('./lib/database');
var sessionHelper = require('./lib/sessionHelper');
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
app.get('/logout', logout);
app.get('/create', create);
app.get('/public/*', serve('.'));

app.post('/api/createAccount', user.createAccount);
app.post('/api/login', user.login);
app.post('/api/user/fileUpload/:folderName', user.fileUpload);
app.post('/api/user/createTempUploadFolder', user.createTempUploadFolder);

function *index() {
	this.body = yield render('index', commonTemplate(this.session));
}

function *create() {
	if(sessionHelper.isLoggedIn(this.session)){
		this.body = yield render('create', commonTemplate(this.session));
	}else{
		this.redirect('/login');
	}
}

function *logout() {
	this.session = null;
	this.redirect('/');
}

function *login() {
	this.body = yield render('login',commonTemplate(this.session));
}

function commonTemplate(session){
	var temp = {}
	temp.email = sessionHelper.getEmail(session)
	return temp
}

app.listen(3006);
console.log('Started ----------------------------------------------');