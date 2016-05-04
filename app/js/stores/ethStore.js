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
    RpcProxy = require("../rpcProxy"),
    appDispatcher = require("../dispatcher/appDispatcher"),
    Parity = require("../parity")

const REAL_RPC_PORT = 7545
const PROXY_RPC_PORT = 8545


module.exports = class EthStore extends configure.Eth(Store){
  constructor(state){
    super(state)

    this.updateState({
      passwords: {},
      pendingTxs: [],
      unconfirmedTxs: {}
    }) 

    this.ethereum = new Ethereum(new Parity({
      datadir: path.join(process.env.HOME, ".parity"),
      rpcPort: REAL_RPC_PORT
    }),{
      rpcPort: PROXY_RPC_PORT
    })

    this.rpcProxy = new RpcProxy({port: PROXY_RPC_PORT, rpcPort: REAL_RPC_PORT})

    this.rpcProxy.on("sendTransaction", (payload) => {
      console.log("ethStore sendTx", payload);

      var password = this.state.passwords[payload.tx.from]
      
      if(password){
        this._sendTransaction(payload.tx, password, payload.resolve)
      }else{
        var pendingTxs = this.state.pendingTxs

        pendingTxs.push(payload)

        this.updateState({ pendingTxs })
      }
    })

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
          this.ethereum.sendTx(payload.action.tx)
        }
      }, {
        actionType: uiMessages.SUBMIT_PASSWORD_TX,
        handler: function(payload){
          var password = payload.action.password,
              state = this.getState(),
              pendingTxs = state.pendingTxs,
              pending = pendingTxs.shift(1)

          console.log("submit", pending);

          if(pending){
            if(!_.isEqual(pending.tx, payload.action.tx)) {
              //this should never happen
              throw new Error("Different pending TX and payload TX")
            }
            
            this._sendTransaction(pending.tx, password, pending.resolve)
            this.updateState({pendingTxs})
          }
        }
      }, {
        actionType: uiMessages.SUBMIT_PASSWORD_UNLOCK,
        handler: function(payload){
          var password = payload.action.password,
              state = this.getState()
          console.log("unlock");

          if(state.accountToUnlock){
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
  _sendTransaction(tx, password,cb){
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

      cb(error, txHash)
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


