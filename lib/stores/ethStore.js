var async = require("async"),
    _ = require("lodash"),
    path = require("path")


var Store = require("./store"),
    ethMessages = require("../../app/js/constants/ethMessages"),
    messages = require("../../app/js/constants/messages"),
    ethConstants = require("../../app/js/constants/ethConstants"),
    uiMessages = require("../../app/js/constants/uiMessages"),
    uiConstants = require("../../app/js/constants/uiConstants"),
    appActions = require("../../app/js/actions/appActions"),
    Ethereum = require("../ethereum"),
    appDispatcher = require("../../app/js/dispatcher/appDispatcher"),
    Parity = require("../parity")



module.exports = class EthStore extends Store{
  get storeName(){ return "ethStore" }
  constructor(){
    super()


    this.ethereum = new Ethereum(new Parity({datadir:path.join(process.env.HOME, ".parity")}))

    
    this.ethereum.startUpdateLoop()

    async.auto({
      loadState: (cb) => {
        // this.loadState((err, state) =>{
        //   _.each(state.transactions, (v,k) => {
        //     this.ethereum.watchTx(k)
        //   })

        //   this.setState(_.extend({
        //     defaultGas: 90000,
        //     pendingTxs: [
        //       //DEBUG
        //       // {
        //       //   from: "0xba5587f8469f9f9a8ea9d49514241ff3a89f26c3",
        //       //   to: "0xba5587f8469f9f9a8ea9d49514241ff3a89f26c3",
        //       //   value: 100000
        //       // }
        //     ]
        //   }, state))

        //   cb()
        // })
      
        cb()
      },
      clientVersion: ["loadState", (res, cb) => {
        this.ethereum.fetchVersion(function(err, version){
          cb(err, version);
        })
      }]
    }, (err, res) => {

      this._processClientState()

      this.updateState({
        version: {
          uiVersion: require("../../package.json").version,
          clientVersion: res.clientVersion
        }
      })
    });
  }
  get listen(){
    return [{
      source: messages.ETHEREUM_CLIENT_ACTION,
      actions: [{
        actionType: ethMessages.CLIENT_STATE,
        handler: function(payload){
          this._processClientState()
        }
      }]
    }, {
      source: messages.USER_ACTION,
      actions: [{
        actionType: uiMessages.SEND_TX,
        handler: function(payload){
          var state = this.getState(),
              password = state.passwords[payload.action.tx.from]
          
          if(password){
            this._sendTransaction(payload.action.tx, password)
          }else{
            state.pendingTxs.push(payload.action.tx)
            this.updateState({
              pendingTxs: state.pendingTxs
            })
          }
        }
      }, {
        actionType: uiMessages.SUBMIT_PASSWORD,
        handler: function(payload){
          var password = payload.action.password,
              state = this.getState(),
              pendingTxs = state.pendingTxs,
              tx = pendingTxs.shift(1)

          if(tx){
            this._sendTransaction(tx, password)
            this.updateState({pendingTxs})
          }else if(state.accountToUnlock){
            state.passwords[state.accountToUnlock] = password
            this.updateState({
              passwords: state.passwords,
              accountToUnlock: undefined
            })
          }
        }
      },{
        actionType: uiMessages.DISMISS_TX,
        handler: function(payload){
          this.updateState({pendingTxs: this.getState().pendingTxs.slice(1)})
        }
      },{
        actionType: uiMessages.LOCK_ACCOUNT,
        handler: function(payload){
          var passwords = this.getState().passwords

          passwords[payload.action.address] = undefined

          this.updateState({passwords})
        }
      },{
        actionType: uiMessages.UNLOCK_ACCOUNT,
        handler: function(payload){
          this.updateState({
            accountToUnlock: payload.action.address
          })
        }
      }]
    }]
  }
  _sendTransaction(tx, password){
    this.ethereum.sendTx(tx, password, (error, txHash) => {
      if(error){
        this.updateState({error})
      } else {
        this.ethereum.watchTx(txHash)

        //TODO: replace all this trash with state save on exit
        // var transactions = this.getState().transactions

        // transactions[txHash] = null
        
        // this.updateState({transactions})
        // this.saveState()
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
  }
  _processClientState(){
    let state = this.ethereum.state
    //console.log("CLIENT STATE", state);
    if(state.syncing){
      this.updateState({clientState: ethConstants.CLIENT_SYNCING})
    }else if(state.running){
      this.updateState({clientState: ethConstants.CLIENT_ACTIVE})
    }else{
      this.updateState({clientState: ethConstants.CLIENT_DISCONNECTED})
    }

    if(state.running){
      this._notifyNewConfirmedTx(state)
      this.updateState(state)
    }
  }
  _notifyNewConfirmedTx(parityState){
    var state = this.getState()
    
    _.each(state.transactions, function(tx){
      if(tx){
        var newTxState = parityState.transactions[tx.hash]
        
        if(newTxState && !tx.blockNumber && newTxState.blockNumber){
          var notification = new Notification("Transaction confirmed", {
            body: tx.hash
          })

          notification.onclick = function(){
            appActions.setContext(uiConstants.CONTEXT_ITEM_TXS, tx.hash)
          }
        }
      }
    })
  }
}


