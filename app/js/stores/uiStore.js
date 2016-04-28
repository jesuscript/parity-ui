var _ = require("lodash")

var Store = require("./store"),
    messages = require("../constants/messages"),
    uiMessages = require("../constants/uiMessages"),
    ethMessages = require("../constants/ethMessages"),
    uiConstants = require("../constants/uiConstants")


var UiStore = function(){
  Store.apply(this, arguments)
}

_.extend(UiStore.prototype, Store.prototype, {
  storeName: "uiStore",
  listen: [{
    source: messages.USER_ACTION,
    actions:[{
      actionType: uiMessages.SET_CONTEXT,
      handler: function(payload){
        this.setContext(payload.action.context, payload.action.scope)
      }
    },{
      actionType: uiMessages.MOVE_CONTEXT_BACK,
      handler: function(payload){
        this.moveContextBack()
      }
    },{
      actionType: uiMessages.MOVE_CONTEXT_FORWARD,
      handler: function(payload){
        this.moveContextForward()
      }
    }]
  },{
    source: messages.ETH_ACTION,
    actions:[{
      actionType: ethMessages.TX_SENT,
      handler: function(payload, cb){
        this.setContext(uiConstants.CONTEXT_ITEM_TXS, payload.action.txHash)
      }
    }]
  }],
  setContext: function(context, scope){
    var state = this.getState()

    if((state.activeContext !== context) || (state.activeScope !== scope)){
      var contextState = {
        activeContext: context,
        activeScope: scope
      }

      var contextHistory = state.contextHistory.slice(0,state.contextIndex+1)

      contextHistory.push(contextState)

      this.updateContext(contextHistory, contextHistory.length - 1)
    }
  },
  moveContextBack: function(){
    this.moveContext(-1)
  },
  moveContextForward: function(){
    this.moveContext(1)
  },
  moveContext: function(i){
    var state = this.getState()

    var contextIndex = state.contextIndex + i
    
    if((contextIndex >= 0) && (contextIndex < state.contextHistory.length)){
      this.updateContext(state.contextHistory, contextIndex)
    }
  },
  updateContext: function(contextHistory, contextIndex){
    this.updateState(_.extend({contextHistory, contextIndex}, contextHistory[contextIndex]))
  }
})

var uiStore = new UiStore()

uiStore.setState({
  contextHistory: [],
  contextIndex: -1,
  contexts: [
    {title: "Accounts", name: uiConstants.CONTEXT_ITEM_ACCOUNTS, icon: "users", type: "main"},
    {title: "Send", name: uiConstants.CONTEXT_ITEM_SEND_TX, icon: "mail", type: "main"},
    {title: "Transactions", name: uiConstants.CONTEXT_ITEM_TXS, icon: "book", type: "main"},
    {title: "Blocks", name: uiConstants.CONTEXT_ITEM_BLOCKS, icon: "stop", type: "main"},
    //experimental
    {
      title: "Web",
      name: uiConstants.CONTEXT_ITEM_PLUGIN_WEB,
      icon: "globe",
      type: "plugin"
    },
    {
      title: "Solidity",
      name: uiConstants.CONTEXT_ITEM_PLUGIN_SOLIDITY,
      icon: "doc-text",
      type: "plugin"
    }
  ]
})

uiStore.setContext(uiConstants.CONTEXT_ITEM_ACCOUNTS)


module.exports = uiStore
