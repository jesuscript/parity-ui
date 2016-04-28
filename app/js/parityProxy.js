var remote = require("remote"),
    path = require("path"),
    fs = remote.require("fs"),
    async = require("async"),
    appDispatcher = require("./dispatcher/appDispatcher"),
    messages =  require("./constants/messages"),
    keythereum = remote.require("keythereum"),
    _ = require("lodash"),
    ethMessages = require("./constants/ethMessages"),
    Web3 = require("web3"),
    RawProvider = require("web3-raw-provider")



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
    syncing: false,
    transactions: []
  };

  this.watchedTxs = []

  this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
}

ParityProxy.prototype = {
  startUpdateLoop: function(){
    var updateClientStatus = () => {
      this.fetchClientStatus((err, res) =>{
        if(err) throw err;

        var syncing = (res.rpcData || {}).syncing

        _.extend(this.state, res.rpcData, {
          running: res.isRunning,
          syncing: syncing && (syncing.currentBlock < syncing.highestBlock)
        })

        this.dispatch(ethMessages.CLIENT_STATE)

        setTimeout(updateClientStatus, 500)
        
      })
    }

    updateClientStatus()
  },
  fetchVersion: function(cb){
    this.parity.fetchVersion(cb);
  },
  dispatch: function(actionType, action){
    appDispatcher.dispatch({
      source: messages.PARITY_ACTION,
      action: _.extend({actionType}, action)
    })
  },
  sendTx: function(tx, password, cb){
    var keypath = path.join(this.parity.opt.datadir, "keys")
    
    fs.readdir(keypath,(err, keyfiles) =>{
      if(err) throw(err)
      async.map(keyfiles, function(file,cb){
        fs.readFile(path.join(keypath, file),function(e,r){
          cb(e, JSON.parse(r.toString()))
        })
      }, (err,res) => {
        var address = tx.from.substr(2),
            senderKey = _.find(res, {address}),
            pk = keythereum.recover(password, senderKey),
            web3 = new Web3(new RawProvider("http://localhost:8545", pk))

        tx.gasPrice = this.state.gasPrice.toString();
        web3.eth.sendTransaction(tx, cb)
      })
    });
  },
  watchTx: function(txHash){
    this.watchedTxs.push(txHash)
  },
  fetchClientStatus: function(cb){
    async.auto({
      isRunning: (cb) =>{
        //TODO: check asynchronously
        try{
          var connected = this.web3.isConnected()
        } catch(e){
          return cb(null, false)
        }
        
        return cb(null, connected)
      },
      rpcData: ["isRunning",(res, cb) =>{
        if(res.isRunning){
          async.auto({
            syncing: this.web3.eth.getSyncing,
            currentBlock: this.web3.eth.getBlockNumber,
            accounts: this.web3.eth.getAccounts,
            gasPrice: this.web3.eth.getGasPrice,
            balances: ["accounts", (res, cb) => {
              async.map(res.accounts, (account,cb)=>{
                this.web3.eth.getBalance(account, (err, bal) => {
                  cb(null, {
                    address: account,
                    balance: bal
                  })
                })
              }, cb)
            }],
            transactions: (cb) => {
              async.reduce(this.watchedTxs, {}, (memo,hash,cb) => {
                if(hash){
                  this.web3.eth.getTransaction(hash, (err, tx) => {
                    if(tx) memo[hash] = tx
                    
                    cb(err, memo)
                  })
                }else{
                  cb(null , memo)
                }
              }, cb)
            }
          },cb)
        }else{
          return cb(null)
        }
      }]
    }, function(err, res){
      cb(err,res)
    })
  }
}

module.exports = ParityProxy;
