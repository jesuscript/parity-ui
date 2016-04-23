
var EventEmitter = require("events").EventEmitter,
    Serializer = require("../dispatcher/serializer"),
    remote = require("remote"),
    electron = require("electron"),
    objects = require("objects"),
    async = require("async"),
    _ = require("lodash")


var appDispatcher = require("../dispatcher/appDispatcher"),
    parityMessages = require("../constants/parityMessages"),
    messages = require("../constants/messages"),
    appConstants = require("../constants/appConstants"),
    ParityProxy = require("../parityProxy"),
    CHANGE_EVENT = "parity-state-change",
    parityState,
    lastEmittedState,
    parityProxy;

//TODO: maintain state in the main process

var parityStore = _.extend({}, EventEmitter.prototype, {
  getState: function(cb){
    return parityState
  },
  setState: function(state){
    parityState = state
    parityStore.emitChanges();
  },
  updateState: function(changes){
    parityStore.setState(_.merge({}, parityState, changes))
  },
  emitChanges: _.debounce(function(){
    if (lastEmittedState) {
      var diff = objects.subtract(lastEmittedState, parityState),
          changes = _.merge({}, diff.added, diff.changed)

      if (_.keys(changes).length) this.emit(CHANGE_EVENT, changes)
    }else{
      this.emit(CHANGE_EVENT, parityState)
    }

    lastEmittedState = parityState
  },5),
  addChangeListener: function(cb){
    parityStore.on(CHANGE_EVENT, cb)
  },
  removeChangeListener: function(cb){
    parityStore.removeListener(CHANGE_EVENT, cb)
  }
})

appDispatcher.register(function(payload){
  var action = payload.action

  if(payload.source === messages.PARITY_ACTION){
    switch(action.actionType){
    case parityMessages.CLIENT_STATE:
      let state = parityProxy.state
      console.log("CLIENT_STATE", state);
      if(state.syncing){
        parityStore.updateState({clientState: appConstants.CLIENT_SYNCING})
      }else if(state.running){
        parityStore.updateState({clientState: appConstants.CLIENT_ACTIVE})
      }else{
        parityStore.updateState({clientState: appConstants.CLIENT_DISCONNECTED})
      }

      if(state.running){
        parityStore.updateState({currentBlock: state.currentBlock, highestBlock: state.highestBlock})
      }
      break
    default:
      console.warn("Unknown parity action type:", action.actionType)
    }
  }

  parityStore.emitChanges();
})

//initialisation

async.auto({
  parityProxy: function(cb){
    cb(null, parityProxy = new ParityProxy())
  },
  clientVersion: ["parityProxy", function(res, cb){
    res.parityProxy.fetchVersion(function(err, version){
      cb(err, version);
    })
  }]
}, function(err, res){
  var state = {
    version: {
      uiVersion: remote.require("./package.json").version,
      clientVersion: res.clientVersion
    }
  };
  parityStore.setState(state);
});

module.exports = parityStore;
