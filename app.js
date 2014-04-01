var render = require('./lib/render')
var config = require('./lib/config')
var Database = require('./lib/database')
var sessionHelper = require('./lib/sessionHelper')
var jsonResp = require('./lib/jsonResp')
var coyoteClient = require('./lib/coyoteClient')
var logger = require('koa-logger')
var router = require('koa-router')
var serve = require('koa-static')
var session = require('koa-session')
var views = require('co-views')
var parse = require('co-body')
var koa = require('koa')
var swig = require('swig')
var request = require('request');
var app = koa()

var Sequelize = Database.getSequelize()
var sequelize = Database.getSequelizeInstance()

var user = require('./controllers/user')
var project = require('./controllers/project')
var file = require('./controllers/file')

var Project = require('./models/project')
var User = require('./models/user')
var File = require('./models/file')
var Purchase = require('./models/purchase')

var coyote = require('file-e-coyote')//TODO move this to its on project/vm
coyote.startServer(config.coyoteOptions)
coyoteClient.createAccount()
sequelize.sync() //{ force: true }
//destroyAll()
//REMOVE IN PRODUCTION??
swig.setDefaults({ cache: false })

//ROUTES
app.keys = [config.sessionSecret]
app.use(session())
app.use(jsonResp())
app.use(router(app))

//PAGE ROUTES
app.get('/', defaultPageLoad('index'))
app.get('/login', defaultPageLoad('login'))
app.get('/faq', defaultPageLoad('faq'))
app.get('/create', defaultPageLoad('create', true))
app.get('/dashboard', defaultPageLoad('dashboard', true))
app.get('/browse', defaultPageLoad('browse'))
app.get('/project/:id', defaultPageLoad('project'))
app.get('/logout', logout)
app.get('/public/*', serve('.'))

//API ROUTES
app.post('/api/createAccount', user.createAccount)
app.post('/api/login', user.login)

app.post('/api/project/create', project.create)
app.get('/api/project/browse', project.browse)
app.get('/api/project/:id', project.getProject)
app.get('/api/project/:id/image', project.getImage)
app.post('/api/project/:id/purchase', project.purchase)

app.get('/api/file/:id/requestDownload', file.requestDownload)


//PAGE HANDLERS
function defaultPageLoad(pageName, requiresLogin) {
	return function *(){
		if(requiresLogin===true && !sessionHelper.isLoggedIn(this.session)){
			this.redirect('/login')
			return
		}

		var temp = sessionHelper.commonTemplate(this.session);
		temp.coyoteURL = config.coyoteAccount.URL
		temp.public_stripe_api_key = config.public_stripe_api_key
		this.body = yield render(pageName, temp)
	}
}

function *logout() {
	this.session = null
	this.redirect('/')
}


function destroyAll() {
	sequelize.sync({force: true})
	coyoteClient.destroyAll()
}

app.listen(config.appPort)
console.log('Started ----------------------------------------------')