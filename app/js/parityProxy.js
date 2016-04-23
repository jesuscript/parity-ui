var remote = require("remote"),
    EventEmitter = require("events").EventEmitter,
    appDispatcher = require("./dispatcher/appDispatcher"),
    messages =  require("./constants/messages"),
    parityMessages = require("./constants/parityMessages"),
    Web3 = require("web3")



/*
 * Disconnected - no running client
 * Syncing - running client, syncing
 * Active - up to date
 */

var ParityProxy = function(){
  this.parity = remote.require("./lib/parity")

  this.state = {
    currentBlock: 0,
    highestBlock: 0,
    running: this.parity.running,
    syncing: false
  };
  
  
  this.parity.on("running", (state) =>{
    this.state.running = state
    this.dispatch(parityMessages.CLIENT_STATE)
  })

  this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

  this.web3.eth.isSyncing((err, sync) => {
    this.state.syncing = !!sync
    if(sync){
      this.dispatch(parityMessages.CLIENT_STATE);

      if(sync.currentBlock) this.state.currentBlock = sync.currentBlock
      if(sync.highestBlock) this.state.highestBlock = sync.highestBlock
    } 
  })
}

ParityProxy.prototype = _.extend({}, EventEmitter.prototype, {
  fetchVersion: function(cb){
    this.parity.fetchVersion(cb);
  },
  dispatch: function(actionType, action){
    appDispatcher.dispatch({
      source: messages.PARITY_ACTION,
      action: _.extend({actionType}, action)
    })
  }
})

module.exports = ParityProxy;
