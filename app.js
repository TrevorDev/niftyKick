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
var project = require('./controllers/project');
var file = require('./controllers/file');
var projectM = require('./models/project');

//REMOVE IN PRODUCTION??
swig.setDefaults({ cache: false })

//ROUTES
app.keys = [config.sessionSecret];
app.use(session());
app.use(jsonResp());
app.use(router(app));

//PAGE ROUTES
app.get('/', index);
app.get('/login', login);
app.get('/logout', logout);
app.get('/create', create);
app.get('/browse', browse);
app.get('/project/:id', project.show);
app.get('/public/*', serve('.'));

//API ROUTES
app.post('/api/createAccount', user.createAccount);
app.post('/api/login', user.login);

app.post('/api/project/createEmptyProject', project.createEmptyProject);
app.get('/api/project/:id/image', project.getImage);
app.post('/api/project/:id/fileUpload', project.fileUpload);
app.post('/api/project/:id/deleteTempFile', project.deleteTempFile);
app.post('/api/project/:id/fileUpload/projectImage', project.projectImageUpload);

app.post('/api/project/:id/create', project.create);

app.get('/api/file/:id/download', file.download);


//PAGE HANDLERS
function *index() {
	this.body = yield render('index', sessionHelper.commonTemplate(this.session));
}

function *create() {
	if(sessionHelper.isLoggedIn(this.session)){
		this.body = yield render('create', sessionHelper.commonTemplate(this.session));
	}else{
		this.redirect('/login');
	}
}

function *logout() {
	this.session = null;
	this.redirect('/');
}

function *login() {
	this.body = yield render('login',sessionHelper.commonTemplate(this.session));
}

function *browse() {
	var temp = sessionHelper.commonTemplate(this.session);
	temp.projects = yield projectM.getAllProjects();
	this.body = yield render('browse',temp);
}



app.listen(3005);
console.log('Started ----------------------------------------------');