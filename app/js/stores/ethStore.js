var remote = require("remote"),
    async = require("async"),
    _ = require("lodash")


var Store = require("./store"),
    ethMessages = require("../constants/ethMessages"),
    messages = require("../constants/messages"),
    ethConstants = require("../constants/ethConstants"),
    uiMessages = require("../constants/uiMessages"),
    ParityProxy = require("../parityProxy"),
    parityProxy;

//TODO: maintain state in the main process

var EthStore = function(){
  Store.apply(this, arguments)
}

_.extend(EthStore.prototype, Store.prototype, {
  listen: [{
    source: messages.PARITY_ACTION,
    actions: [{
      actionType: ethMessages.CLIENT_STATE,
      handler: (payload, cb) => {
        processClientState()
        cb()
      }
    }],
    source: messages.USER_ACTION,
    actions: [{
      actionType: uiMessages.SEND_TX,
      handler: (payload, cb) => {
        console.log("pl", payload);
      }
    }]
  }]
})

var ethStore = new EthStore()


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

  ethStore.updateState({
    version: {
      uiVersion: remote.require("./package.json").version,
      clientVersion: res.clientVersion
    }
  })
});


function processClientState(){
  let state = parityProxy.state
  //console.log("CLIENT_STATE", state);
  if(state.syncing){
    ethStore.updateState({clientState: ethConstants.CLIENT_SYNCING})
  }else if(state.running){
    ethStore.updateState({clientState: ethConstants.CLIENT_ACTIVE})
  }else{
    ethStore.updateState({clientState: ethConstants.CLIENT_DISCONNECTED})
  }

  if(state.running){
    ethStore.updateState(state)
  }
}

ethStore.setState({
  defaultGas: 90000
})

module.exports = ethStore;
