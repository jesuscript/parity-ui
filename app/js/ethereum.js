var path = require("path"),
    fs = require("fs"),
    async = require("async"),
    keythereum = require("keythereum"),
    _ = require("lodash"),
    Web3 = require("web3"),
    RawProvider = require("web3-raw-provider"),
    BigNumber = require("bignumber.js")

var appDispatcher = require("./dispatcher/appDispatcher"),
    messages =  require("./constants/messages"),
    ethMessages = require("./constants/ethMessages"),
    util = require("./util")


/*
 * Disconnected - no running client
 * Syncing - running client, syncing
 * Active - up to date
 */

module.exports = class Ethereum {
  constructor(client, opt){
    this.client = client
    this.rpcPort = opt.rpcPort

    this.state = {
      currentBlock: 0,
      running: false,
      syncing: false,
      transactions: []
    };

    this.watchedTxs = []

    this.web3 = new Web3(new Web3.providers.HttpProvider(
      `http://localhost:${this.rpcPort}`
    ))
  }
  startUpdateLoop(){
    var updateClientStatus = () => {
      this.fetchClientStatus((err, res) =>{
        if(err) return console.error(err);

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
  }
  fetchVersion(cb){
    this.client.fetchVersion(cb);
  }
  dispatch(actionType, action){
    appDispatcher.dispatch({
      source: messages.ETHEREUM_CLIENT_ACTION,
      action: _.extend({actionType}, action)
    })
  }
  sendTx(){
    var tx = arguments[0],
        cb = function(){},
        password
        
    
    if(arguments.length === 3){
      password = arguments[1]
      cb = arguments[2]
    }else if(arguments.length === 2){
      cb = arguments[1]
    }

    if(password){
      var keypath = path.join(this.client.opt.datadir, "keys")
      
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
              web3 = new Web3(new RawProvider("http://localhost:"+this.rpcPort, pk))

          tx.gasPrice = this.state.gasPrice.toString();
          web3.eth.sendTransaction(tx, cb)
        })
      });
    }else{
      this.web3.eth.sendTransaction(tx, cb)
    }
  }
  watchTx(txHash){
    this.watchedTxs.push(txHash)
  }
  fetchClientStatus(cb){
    async.auto({
      isRunning: (cb) =>{
        util.ping("localhost", this.rpcPort, cb)
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
                  cb(err, {
                    address: account,
                    //bit of a hack, but BigNumber cannot be passed over ipc otherwise
                    balance: bal && bal.toString()
                  })

                })
              }, cb)
            }],
            transactions: (cb) => {
              async.reduce(this.watchedTxs, {}, (memo,hash,cb) => {
                if(hash){
                  this.web3.eth.getTransaction(hash, (err, tx) => {
                    if(tx) {
                      memo[hash] = tx
                      
                      _.each(tx, function(v,k){
                        memo[hash][k] = (v instanceof BigNumber) ? v.toString() : v
                      })
                    }
                    
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

