var async = require("async"),
    _ = require("lodash"),
    path = require("path")


var Store = require("./store"),
    configure = require("./configure"),
    ethMessages = require("../constants/ethMessages"),
    messages = require("../constants/messages"),
    ethConstants = require("../constants/ethConstants"),
    uiMessages = require("../constants/uiMessages"),
    uiConstants = require("../constants/uiConstants"),
    appActions = require("../actions/appActions"),
    Ethereum = require("../ethereum"),
    appDispatcher = require("../dispatcher/appDispatcher"),
    Parity = require("../parity")



module.exports = class EthStore extends configure.Eth(Store){
  constructor(state){
    super(state)

    this.updateState({
      passwords: {},
      pendingTxs: [],
      unconfirmedTxs: {}
    }) 

    this.ethereum = new Ethereum(new Parity({datadir:path.join(process.env.HOME, ".parity")}))

    _.each(this.state.transactions, (tx,hash) => {
      this.ethereum.watchTx(hash)
    })
    
    this.ethereum.startUpdateLoop()

    async.auto({
      clientVersion: (cb) => {
        this.ethereum.fetchVersion(function(err, version){
          cb(err, version);
        })
      }
    }, (err, res) => {

      this._processClientState()

      this.updateState({
        version: {
          uiVersion: require("../../../package.json").version,
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
          var password = this.state.passwords[payload.action.tx.from]
          
          if(password){
            this._sendTransaction(payload.action.tx, password)
          }else{
            var pendingTxs = this.state.pendingTxs

            pendingTxs.push(payload.action.tx)

            this.updateState({ pendingTxs })
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
          this.updateState({pendingTxs: this.state.pendingTxs.slice(1)})
        }
      },{
        actionType: uiMessages.LOCK_ACCOUNT,
        handler: function(payload){
          var passwords = this.state.passwords

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
        var unconfirmedTxs = this.state.unconfirmedTxs
        unconfirmedTxs[txHash] = true
        this.updateState({unconfirmedTxs})
        
        this.ethereum.watchTx(txHash)
        
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
      let unconfirmedTxs = this.state.unconfirmedTxs
      
      _.each(unconfirmedTxs, (utx,hash) => {
        var tx = state.transactions[hash]
        if(tx){
          if(tx.blockNumber){
            _.unset(unconfirmedTxs, hash)
          }
        }
      })

      this.updateState(_.extend({unconfirmedTxs}, state))
    }
  }
  get stateToSave(){
    return _.pick(this.state, "transactions")
  }
}


