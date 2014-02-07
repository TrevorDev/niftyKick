var db = require('./../lib/database');
var Q = require('q');
var path = require('path');
var config = require('../lib/config');
var fs = require('co-fs');

exports.STATUS = {CREATING: 0, ACTIVE: 1, DELETED: 2}

//FOLDER ACCESS STUFF
var ROOT_FOLDER = path.join(config.appRoot, "userFiles/projects");
var ASSETS_FOLDER_NAME = "projectAssets";
var FILES_FOLDER_NAME = "files";
exports.DISPLAY_IMAGE = "displayImage.jpg";

function getUserFolder(userID){
	return path.join(ROOT_FOLDER, userID.toString());
}
exports.getUserFolder = getUserFolder;

function getProjectFolder(projectID, userID){
	return path.join(getUserFolder(userID), projectID.toString());
}
exports.getProjectFolder = getProjectFolder;

function getAssetsFolder(projectID, userID){
	return path.join(getProjectFolder(projectID, userID), ASSETS_FOLDER_NAME);
}
exports.getAssetsFolder = getAssetsFolder;

function getFilesFolder(projectID, userID){
	return path.join(getProjectFolder(projectID, userID), FILES_FOLDER_NAME);
}
exports.getFilesFolder = getFilesFolder;

//MODEL FUNCTIONS -------------------------------------------------------------------------------

exports.create = Q.async(function *(userID, type, title, price, info, description,videoLink, displayImage, status) {
	var ret = (yield db.query('insert into project (user_id, type, title, price, info, description,video_link,display_image, status) VALUES (?, ?, ?, ?, ?, ?,?,?,?)',[userID, type, title, price, info, description,videoLink,displayImage,status]));
  try{
    yield fs.mkdir(getUserFolder(userID));
  }catch(e){
  }
  yield fs.mkdir(getProjectFolder(ret.insertId.toString(), userID));
  yield fs.mkdir(getAssetsFolder(ret.insertId.toString(), userID));
  yield fs.mkdir(getFilesFolder(ret.insertId.toString(), userID));
	return ret;
})

exports.update = Q.async(function *(projectID, userID, type, title, price, info, description,videoLink, displayImage, status) {
	var ret = (yield db.query('update project set user_id = ?, type = ?, title = ?, price = ?, info = ?, description = ?,video_link = ?,display_image = ?, status = ? where id = ?;',[userID, type, title, price, info, description,videoLink,displayImage,status,projectID]));
console.log(ret)
	return ret;
})	

exports.find = Q.async(function *(id) {
	var ret = (yield db.query('select * from project where id = ?',[id]));
	return ret;
})

exports.getImage = Q.async(function *(id) {
	var ret = (yield db.query('select user_id, display_image from project where id = ?',[id]));
	return ret;
})

