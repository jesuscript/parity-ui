"use strict";

var EventEmitter = require("events").EventEmitter,
    Serializer = require("../dispatcher/serializer"),
    remote = require("remote"),
    electron = require("electron"),
    objects = require("objects"),
    async = require("async"),
    exec = remote.require("child_process").exec,
    _ = require("lodash")


var appDispatcher = require("../dispatcher/appDispatcher"),
    messages = require("../constants/messages"),
    appConstants = require("../constants/appConstants"),
    CHANGE_EVENT = "parity-state-change",
    parityState,
    lastEmittedState;

//TODO: maintain state in the main process

var parityStore = _.extend({}, EventEmitter.prototype, {
  getState: function(cb){
    return parityState
  },
  setState: function(){
    parityState = state
    parityStore.emitChanges();
  },
  emitChanges: _.debounce(function(){
    if (lastEmittedState) {
      var diff = objects.subtract(lastEmittedState, parityState),
          changes = _.merge({}, diff.added, diff.chaged)

      if (_.keys(changes).length) this.emit(CHANGE_EVENT, changes)
    }else{
      console.log("emit", parityState);
      this.emit(CHANGE_EVENT, parityState)
    }

    lastEmittedState = parityState
  },5),
  addChangeListener: function(cb){
    console.log("addchangelistener");
    parityStore.on(CHANGE_EVENT, cb)
  },
  removeChangeListener: function(cb){
    parityStore.removeListener(CHANGE_EVENT, cb)
  }
})

appDispatcher.register(function(payload){
  var action = payload.action

  switch(action.actionType){
    //case appConstants:
    default:
  }
})

//initialisation

var state = {
  version: {
    uiVersion: remote.require("./package.json").version 
  }
};
async.auto({
  fetchVersion: function(cb){
    exec("parity -v", (err, stdout, stderr) => {
      if(err) throw err;
      if(stdout){
        _.each(stdout.split("\n"), (s) => {
          var match = s.match(/version\sParity([^\s]*)/);

          if(match) _.extend(state.version, {clientVersion: match[1].split("/")[1]});
        });
      }

      cb();
    })
  }
}, function(){
  parityStore.setState(state);
});



module.exports = parityStore;
