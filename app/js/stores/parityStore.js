"use strict";

var EventEmitter = require("events").EventEmitter,
    Serializer = require("../dispatcher/serializer"),
    _ = require("lodash")
    

var appDispatcher = require("../dispatcher/appDispatcher");

module.exports = _.extend({}, EventEmitter.prototype, {
  getVersion: function(){
    
  }
})

require("electron").ipcMain.on(messages.APP_ACTION, (event, action) => {
  action = Serializer.deserialize(action)
  switch(action.actionType){
  case AppConstants:
  default:
  }
})
