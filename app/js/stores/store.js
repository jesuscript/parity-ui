var _ = require("lodash"),
    electron = require("electron"),
    ipc = electron.ipcMain,
    EventEmitter = require("events").EventEmitter,
    //stateStorage = require("../stateStorage"),
    BrowserWindow = electron.BrowserWindow


var appDispatcher = require("../dispatcher/appDispatcher"),
    messages = require("../constants/messages")

var CHANGE_EVENT = "store-state-change"

module.exports = class Store extends EventEmitter{
  constructor(state){
    super()

    if(!this.storeName) throw new Error("A store must have a name!")
    if(!this.changeEventMessage) throw new Error("changeEventMessage not set!")
    
    this.state = state
    
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
    ipc.on(messages.DISPATCHER_MESSAGE, function(e, pl){ handleAction(pl); })
    ipc.on(this.getStateMessage, (e) => {
      // for broadcasting only diffs on change, this would need to broadcast state instead
      // of sending
      e.sender.send(this.changeEventMessage, this.state)
    })
  }
  get state(){
    return this.getState()
  }
  set state(state){
    this.setState(state)
  }
  updateState(changes){
    this.setState(_.extend({}, this._state, changes))
  }
  setState(state){
    this._state = state
    this.emitChanges();
  }
  getState(){
    return _.cloneDeep(this._state)
  }
  addChangeListener(cb){
    this.on(CHANGE_EVENT, cb)
  }
  removeChangeListener(cb){
    this.removeListener(CHANGE_EVENT, cb)
  }
  emitChanges(){
    BrowserWindow.getAllWindows().forEach((wnd) =>{
      //TODO calculate and send only state - lastState diffs (optimisation)
      wnd.webContents.send(this.changeEventMessage, this.state)
    })

    this.emit(CHANGE_EVENT)
  }
}


