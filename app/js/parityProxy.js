var remote = require("remote"),
    async = require("async"),
    appDispatcher = require("./dispatcher/appDispatcher"),
    messages =  require("./constants/messages"),
    _ = require("lodash"),
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
    running: false,
    syncing: false
  };

  this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

  var checkClientStatus = () =>{
    async.auto({
      isRunning: (cb) =>{
        return cb(null, this.web3.isConnected())
      },
      rpcData: ["isRunning",(res, cb) =>{
        if(res.isRunning){
          async.auto({
            isSyncing: (cb) =>{
              return this.web3.eth.getSyncing(cb)
            },
            currentBlock:(cb) => {
              return this.web3.eth.getBlockNumber(cb)
            }
          },cb)
        }else{
          return cb(null)
        }
      }]
    }, (err, res) =>{
      if(err) throw err;

      _.extend(this.state, {
        running: res.isRunning
      }, res.rpcData)

      this.dispatch(parityMessages.CLIENT_STATE)
      setTimeout(checkClientStatus, 400)
    })
  }

  checkClientStatus()
}

ParityProxy.prototype = {
  fetchVersion: function(cb){
    this.parity.fetchVersion(cb);
  },
  dispatch: function(actionType, action){
    appDispatcher.dispatch({
      source: messages.PARITY_ACTION,
      action: _.extend({actionType}, action)
    })
  }
}

module.exports = ParityProxy;
