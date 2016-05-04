var _ = require("lodash"),
    async = require("async")

var UiStore = require("./uiStore"),
    uiConstants = require("../constants/uiConstants"),
    EthStore = require("./ethStore"),
    stateStorage = require("./stateStorage")


module.exports = function(appDir, cb){
  var stores = {};

  stateStorage.initDir(appDir)
  
  async.each([EthStore, UiStore], function(Store, cb){
    var storeName = Store.prototype.storeName
    
    stateStorage.load(storeName, function(err, state){
      stores[storeName] = new Store(state)
      cb(err)
    })
  }, function(err){
    stores.uiStore.updateState({
      contextHistory: [],
      contextIndex: -1,
      contexts: [
        {title: "Accounts", name: uiConstants.CONTEXT_ITEM_ACCOUNTS, icon: "users", type: "main"},
        {title: "Send", name: uiConstants.CONTEXT_ITEM_SEND_TX, icon: "mail", type: "main"},
        {title: "Transactions", name: uiConstants.CONTEXT_ITEM_TXS, icon: "book", type: "main"}
      ]
    })
    stores.uiStore.setContext(uiConstants.CONTEXT_ITEM_ACCOUNTS)

    process.on("exit", function(){
      _.each(stores, function(store, name){
        var state = store.stateToSave

        if(state) stateStorage.save(name, state, function(){
          console.log("saved state for", name);
        })
      })
    })

    cb(err, stores)
  })
  
}



