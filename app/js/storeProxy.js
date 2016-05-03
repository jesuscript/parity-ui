var EventEmitter = require("events").EventEmitter,
    messages = require("./constants/messages"),
    ipc = require('electron').ipcRenderer,
    _ = require("lodash")

var CHANGE_EVENT = "store-state-change"

var stores = {
  eth: {
    changeEvent: messages.ETH_STORE_CHANGE,
    getState: messages.ETH_STORE_GET_STATE
  },
  ui: {
    changeEvent: messages.UI_STORE_CHANGE,
    getState: messages.UI_STORE_GET_STATE
  }
}

var StoreProxy = function(storeName){
  var store = stores[storeName]

  if(!store) throw new Error("Unknown store: " + storeName)

  var setState = (e, state) =>{
    this.state = state
  }
  
  ipc.on(store.changeEvent, setState)
  ipc.send(store.getState, setState)
}

_.extend(StoreProxy.prototype, EventEmitter.prototype, {
  set state(s){
    //TODO: parital state updates
    this.storeState = s
    this.emit(CHANGE_EVENT)
  },
  get state(){
    //TODO: replace with immutable
    return _.cloneDeep(this.storeState)
  },
  addChangeListener (callback) {
    this.on(CHANGE_EVENT, callback)
  },
  removeChangeListener (callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }
})

module.exports = StoreProxy
