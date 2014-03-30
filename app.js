var render = require('./lib/render')
var config = require('./lib/config')
var Database = require('./lib/database')
var sessionHelper = require('./lib/sessionHelper')
var jsonResp = require('./lib/jsonResp')
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
request.post(config.coyoteAccount.URL+"account/create?masterSecret="+config.coyoteOptions.masterSecret+"&name="+config.coyoteAccount.name+"&token="+config.coyoteAccount.token)
sequelize.sync() //{ force: true }

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
app.get('/browse', browse)
app.get('/project/:id', project.show)
app.get('/logout', logout)
app.get('/public/*', serve('.'))

//API ROUTES
app.post('/api/createAccount', user.createAccount)
app.post('/api/login', user.login)

app.get('/api/project/:id/image', project.getImage)
app.post('/api/project/:id/purchase', project.purchase)

app.post('/api/project/:id/create', project.create)

app.get('/api/file/:id/download', file.download)


//PAGE HANDLERS
function defaultPageLoad(pageName, requiresLogin) {
	return function *(){
		if(requiresLogin===true && !sessionHelper.isLoggedIn(this.session)){
			this.redirect('/login')
			return
		}

		var temp = sessionHelper.commonTemplate(this.session);
		temp.coyoteURL = config.coyoteAccount.URL
		this.body = yield render(pageName, temp)
	}
}

function *logout() {
	this.session = null
	this.redirect('/')
}

function *browse() {
	var temp = sessionHelper.commonTemplate(this.session)
	temp.projects = yield Project.findAll({where: {status: Project.STATUS.ACTIVE}})
	this.body = yield render('browse',temp)
}



app.listen(config.appPort)
console.log('Started ----------------------------------------------')