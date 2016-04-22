"use strict"
var _ = require("lodash"),
    util = require("util"),
    Dispatcher = require("flux").Dispatcher

var messages = require("../constants/messages")
    
var AppDispatcher = function(){
  Dispatcher.call(this)
}

util.inherits(AppDispatcher, Dispatcher)

module.exports =  new AppDispatcher()


