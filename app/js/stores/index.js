var UiStore = require("./uiStore"),
    uiConstants = require("../constants/uiConstants"),
    EthStore = require("./ethStore")

var uiStore = new UiStore({
  contextHistory: [],
  contextIndex: -1,
  contexts: [
    {title: "Accounts", name: uiConstants.CONTEXT_ITEM_ACCOUNTS, icon: "users", type: "main"},
    {title: "Send", name: uiConstants.CONTEXT_ITEM_SEND_TX, icon: "mail", type: "main"},
    {title: "Transactions", name: uiConstants.CONTEXT_ITEM_TXS, icon: "book", type: "main"},
    {title: "Blocks", name: uiConstants.CONTEXT_ITEM_BLOCKS, icon: "stop", type: "main"}
  ]
})

uiStore.setContext(uiConstants.CONTEXT_ITEM_ACCOUNTS)

module.exports = {
  uiStore,
  ethStore: new EthStore()
}


