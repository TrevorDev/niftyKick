exports.setLoggedIn = function(session, email){
	if(!session){
		return null;
	}
	session.email = email
}

exports.isLoggedIn = function(session){
	if(!session){
		return null;
	}
	return session.email
}

exports.getEmail = function(session){
	if(!session){
		return null;
	}
	return session.email
}