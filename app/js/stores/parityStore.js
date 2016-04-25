var EventEmitter = require("events").EventEmitter,
    remote = require("remote"),
    objects = require("objects"),
    async = require("async"),
    _ = require("lodash")


var appDispatcher = require("../dispatcher/appDispatcher"),
    parityMessages = require("../constants/parityMessages"),
    messages = require("../constants/messages"),
    parityConstants = require("../constants/parityConstants"),
    ParityProxy = require("../parityProxy"),
    CHANGE_EVENT = "parity-state-change",
    parityState,
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
    this.emit(CHANGE_EVENT, parityState)
  },5),
  addChangeListener: function(cb){
    parityStore.on(CHANGE_EVENT, cb)
  },
  removeChangeListener: function(cb){
    parityStore.removeListener(CHANGE_EVENT, cb)
  }
})

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
  processClientState()

  parityStore.updateState({
    version: {
      uiVersion: remote.require("./package.json").version,
      clientVersion: res.clientVersion
    }
  })
});

appDispatcher.register(function(payload){
  var action = payload.action

  if(payload.source === messages.PARITY_ACTION){
    switch(action.actionType){
    case parityMessages.CLIENT_STATE:
      processClientState()
      break
    default:
      console.warn("Unknown parity action type:", action.actionType)
    }
  }

  parityStore.emitChanges();
})

function processClientState(){
  let state = parityProxy.state
  //console.log("CLIENT_STATE", state);
  if(state.syncing){
    parityStore.updateState({clientState: parityConstants.CLIENT_SYNCING})
  }else if(state.running){
    parityStore.updateState({clientState: parityConstants.CLIENT_ACTIVE})
  }else{
    parityStore.updateState({clientState: parityConstants.CLIENT_DISCONNECTED})
  }

  if(state.running){
    parityStore.updateState({currentBlock: state.currentBlock, highestBlock: state.highestBlock})
  }
}



module.exports = parityStore;
