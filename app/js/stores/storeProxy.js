var EventEmitter = require("events").EventEmitter,
    ipc = require('electron').ipcRenderer,
    _ = require("lodash")
    

var messages = require("../constants/messages"),
    storeConfigs = require("./configure")

var CHANGE_EVENT = "store-state-change"




module.exports = class StoreProxy extends EventEmitter {
  constructor(storeName){
    super()
    
    var Store = storeConfigs[storeName](function(){})

    if(!Store) throw new Error("Unknown store: " + storeName)

    ipc.on(Store.prototype.changeEventMessage, (e, state) =>{
      this.state = state
    })
    ipc.send(Store.prototype.getStateMessage)
  }
  set state(s){
    //TODO: parital state updates
    this._state = s
    this.emit(CHANGE_EVENT)
  }
  get state(){
    //TODO: replace with immutable
    return _.cloneDeep(this._state)
  }
  addChangeListener (callback) {
    this.on(CHANGE_EVENT, callback)
  }
  removeChangeListener (callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }
}
