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

var multiParse = require('co-busboy')
var fs = require('co-fs');
var os = require('os');
var path = require('path');
var saveTo = require('save-to');

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
app.post('/api/user/:id/fileUpload', fileUpload);

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

function *fileUpload() {
	// parse the multipart body
  var parts = multiParse(this, {
    autoFields: true // saves the fields to parts.field(s)
  });

  // create a temporary folder to store files
  var tmpdir = path.join(os.tmpdir(), uid());

  // make the temporary directory
  yield fs.mkdir(tmpdir);

  // list of all the files
  var files = [];
  var file;

  // yield each part as a stream
  var part;
  while (part = yield parts) {
    // filename for this part
    files.push(file = path.join(tmpdir, part.filename));
    // save the file
    yield saveTo(part, file);
  }

  // return all the filenames as an array
  // after all the files have finished downloading
  console.log(files);
  this.body = files;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function commonTemplate(session){
	var temp = {}
	temp.email = sessionHelper.getEmail(session)
	return temp
}

app.listen(3006);
console.log('Started ----------------------------------------------');