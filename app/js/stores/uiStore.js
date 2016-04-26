var _ = require("lodash")

var Store = require("./store"),
    messages = require("../constants/messages"),
    uiMessages = require("../constants/uiMessages"),
    uiConstants = require("../constants/uiConstants")


var UiStore = function(){
  Store.apply(this, arguments)
}

_.extend(UiStore.prototype, Store.prototype, {
  listen: [{
    source: messages.USER_ACTION,
    actions:[{
      actionType: uiMessages.SET_CONTEXT,
      handler: function(payload, cb){
        this.updateState({activeContext: payload.action.name})
      }
    }]
  }]
})

var uiStore = new UiStore()

uiStore.setState({
  contexts: [
    {title: "Accounts", name: uiConstants.CONTEXT_ITEM_ACCOUNTS, icon: "users"},
    {title: "Send", name: uiConstants.CONTEXT_ITEM_SEND_TX, icon: "mail"},
    {title: "Transactions", name: uiConstants.CONTEXT_ITEM_TXS, icon: "book"},
    {title: "Blocks", name: uiConstants.CONTEXT_ITEM_BLOCKS, icon: "stop"}
  ],
  //activeContext: uiConstants.CONTEXT_ITEM_ACCOUNTS
  activeContext: uiConstants.CONTEXT_ITEM_SEND_TX
})


module.exports = uiStore
