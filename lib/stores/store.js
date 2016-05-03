var _ = require("lodash"),
    ipc = require("electron").ipcMain,
    EventEmitter = require("events").EventEmitter,
    //stateStorage = require("../stateStorage"),
    messages = require("../../app/js/constants/messages")

var appDispatcher = require("../../app/js/dispatcher/appDispatcher")

var CHANGE_EVENT = "store-state-change"

module.exports = class Store extends EventEmitter{
  constructor(){
    super()
    
    if(!this.storeName) throw new Error("A store must have a name!")
    var listenMap = {}

    _.each(this.listen, (event) => {
      listenMap[event.source] = {}
      _.each(event.actions, (action) => {
        listenMap[event.source][action.actionType] = action.handler
      })
    })

    var handleAction = (payload) => {
      var handler = (listenMap[payload.source] || {})[payload.action.actionType]

      if(handler) handler.call(this, payload)
    }

    appDispatcher.register(handleAction)
    ipc.on(messages.DISPATCHER_MESSAGE, handleAction)

    this.emitChanges = _.debounce(() => {
      
      this.emit(CHANGE_EVENT)
    },5)
  }
  getState(cb){
    return _.cloneDeep(this._state)
  }
  setState(state){
    this._state = state
    this.emitChanges();
  }
  updateState(changes){
    this.setState(_.extend({}, this._state, changes))
  }
  addChangeListener(cb){
    this.on(CHANGE_EVENT, cb)
  }
  removeChangeListener(cb){
    this.removeListener(CHANGE_EVENT, cb)
  }
}


