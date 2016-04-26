var remote = require("remote"),
    async = require("async"),
    appDispatcher = require("./dispatcher/appDispatcher"),
    messages =  require("./constants/messages"),
    _ = require("lodash"),
    ethMessages = require("./constants/ethMessages"),
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
            syncing: (cb) =>{
              return this.web3.eth.getSyncing(cb)
            },
            currentBlock:(cb) => {
              return this.web3.eth.getBlockNumber(cb)
            },
            accounts: (cb) => {
              return this.web3.eth.getAccounts(cb)
            },
            balances: ["accounts", (res, cb) => {
              //TODO: replace with async.map + fetch balance
              async.map(res.accounts, (account,cb)=>{
                this.web3.eth.getBalance(account, (err, bal) => {
                  cb(null, {
                    address: account,
                    balance: bal
                  })
                })
              }, cb)
              //async.map(res.accounts, this.web3.eth.getBalance, cb)
            }]
          },cb)
        }else{
          return cb(null)
        }
      }]
    }, (err, res) =>{
      if(err) throw err;

      var syncing = res.rpcData.syncing

      _.extend(this.state, res.rpcData, {
        running: res.isRunning,
        syncing: syncing && (syncing.currentBlock < syncing.highestBlock)
      })

      this.dispatch(ethMessages.CLIENT_STATE)
      setTimeout(checkClientStatus, 500)
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
