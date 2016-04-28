var remote = require("remote"),
    async = require("async"),
    _ = require("lodash")


var Store = require("./store"),
    ethMessages = require("../constants/ethMessages"),
    messages = require("../constants/messages"),
    ethConstants = require("../constants/ethConstants"),
    uiMessages = require("../constants/uiMessages"),
    ParityProxy = require("../parityProxy"),
    appDispatcher = require("../dispatcher/appDispatcher");


//TODO: maintain state in the main process

var EthStore = function(){
  Store.apply(this, arguments)

  //==DEBUG
  var passwords = {}
  passwords["0xba5587f8469f9f9a8ea9d49514241ff3a89f26c3"] = "asdf"
  //==

  this._parityProxy = new ParityProxy()

  this._parityProxy.startUpdateLoop()

  async.auto({
    loadState: (cb) => {
      this.loadState((err, state) =>{
        _.each(state.transactions, (v,k) => {
          this._parityProxy.watchTx(k)
        })

        this.setState(_.extend({
          defaultGas: 90000,
          passwords
        }, state))

        cb()
      })
    },
    clientVersion: ["loadState", (res, cb) => {
      this._parityProxy.fetchVersion(function(err, version){
        cb(err, version);
      })
    }]
  }, (err, res) => {
    this._processClientState()

    ethStore.updateState({
      version: {
        uiVersion: remote.require("./package.json").version,
        clientVersion: res.clientVersion
      }
    })
  });

}

_.extend(EthStore.prototype, Store.prototype, {
  storeName: "ethStore",
  listen: [{
    source: messages.PARITY_ACTION,
    actions: [{
      actionType: ethMessages.CLIENT_STATE,
      handler: function(payload, cb){
        this._processClientState()
      }
    }]
  }, {
    source: messages.USER_ACTION,
    actions: [{
      actionType: uiMessages.SEND_TX,
      handler: function(payload, cb){
        var state = this.getState(),
            password = state.passwords[payload.action.tx.from]
        
        if(password){
          this._parityProxy.sendTx(payload.action.tx, password, (error, txHash) => {
            if(error){
              this.setState({error})
            } else {
              this._parityProxy.watchTx(txHash)

              //TODO: replace all this trash with state save on exit
              var transactions = this.getState().transactions

              transactions[txHash] = null
              
              this.updateState({transactions})
              this.saveState()
              // /trash

              appDispatcher.dispatch({
                source: messages.ETH_ACTION,
                action:{
                  actionType: ethMessages.TX_SENT,
                  txHash
                }
              })
            }
          })
        }else{
          if(!state.pendingTx){
            this.setState({
              pendingTx: payload.action.tx
            })
          }else{
            this.setState({
              error: {
                msg: "Attempted to replace an existing pending transaction!",
                tx: payload.action.tx
              }
            })
          }
        }
      }
    }]    
  }],
  _processClientState: function(){
    let state = this._parityProxy.state
    //console.log("CLIENT STATE", state);
    if(state.syncing){
      this.updateState({clientState: ethConstants.CLIENT_SYNCING})
    }else if(state.running){
      this.updateState({clientState: ethConstants.CLIENT_ACTIVE})
    }else{
      this.updateState({clientState: ethConstants.CLIENT_DISCONNECTED})
    }

    if(state.running){
      this.updateState(state)
    }
  }
})

var ethStore = new EthStore()






module.exports = ethStore;
