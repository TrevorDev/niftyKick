var render = require('./lib/render');
var config = require('./lib/config');
var Database = require('./lib/database');
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

var Sequelize = Database.getSequelize();
var sequelize = Database.getSequelizeInstance();

var user = require('./controllers/user');
var project = require('./controllers/project');
var file = require('./controllers/file');

var Project = require('./models/project');
var User = require('./models/user');
var File = require('./models/file');
var Purchase = require('./models/purchase');

//sequelize.sync({ force: true });

//REMOVE IN PRODUCTION??
swig.setDefaults({ cache: false })

//ROUTES
app.keys = [config.sessionSecret];
app.use(session());
app.use(jsonResp());
app.use(router(app));

//PAGE ROUTES
app.get('/', defaultPageLoad('index'));
app.get('/login', defaultPageLoad('login'));
app.get('/logout', logout);
app.get('/create', defaultPageLoad('create', true));
app.get('/browse', browse);
app.get('/faq', defaultPageLoad('faq'));
app.get('/project/:id', project.show);
app.get('/public/*', serve('.'));

//API ROUTES
app.post('/api/createAccount', user.createAccount);
app.post('/api/login', user.login);

app.post('/api/project/createEmptyProject', project.createEmptyProject);
app.get('/api/project/:id/image', project.getImage);
app.post('/api/project/:id/purchase', project.purchase);
app.post('/api/project/:id/fileUpload', project.fileUpload);
app.post('/api/project/:id/deleteTempFile', project.deleteTempFile);
app.post('/api/project/:id/fileUpload/projectImage', project.projectImageUpload);

app.post('/api/project/:id/create', project.create);

app.get('/api/file/:id/download', file.download);


//PAGE HANDLERS
function defaultPageLoad(pageName, requiresLogin) {
	return function *(){
		if(requiresLogin===true && !sessionHelper.isLoggedIn(this.session)){
			this.redirect('/login');
			return
		}
		this.body = yield render(pageName, sessionHelper.commonTemplate(this.session));
	}
}

function *logout() {
	this.session = null;
	this.redirect('/');
}

function *browse() {
	var temp = sessionHelper.commonTemplate(this.session);
	temp.projects = yield Project.findAll({where: {status: Project.STATUS.ACTIVE}});
	this.body = yield render('browse',temp);
}



app.listen(3005);
console.log('Started ----------------------------------------------');