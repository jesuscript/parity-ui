var _ = require("lodash"),
    fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    remote = require("remote"),
    stateStorage = remote.require("./lib/stateStorage")

var appDispatcher = require("../dispatcher/appDispatcher")

var CHANGE_EVENT = "parity-state-change"

var Store = function(){
  if(!this.storeName) throw new Error("A store must have a name!")
  var listenMap = {}

  _.each(this.listen, (event) => {
    listenMap[event.source] = {}
    _.each(event.actions, (action) => {
      listenMap[event.source][action.actionType] = action.handler
    })
  })

  appDispatcher.register((payload) => {
    var handler = (listenMap[payload.source] || {})[payload.action.actionType]

    //console.log(this.listen);

    if(handler) handler.call(this, payload)
  })
}

_.extend(Store.prototype, EventEmitter.prototype, {
  storeName: "store",
  _state: {},
  listen: [],
  getState: function(cb){
    return _.cloneDeep(this._state)
  },
  setState: function(state){
    this._state = state
    this.emitChanges();
  },
  updateState: function(changes){
    this.setState(_.extend({}, this._state, changes))
  },
  emitChanges: _.debounce(function(){
    this.emit(CHANGE_EVENT)
  },5),
  addChangeListener: function(cb){
    this.on(CHANGE_EVENT, cb)
  },
  removeChangeListener: function(cb){
    this.removeListener(CHANGE_EVENT, cb)
  },
  saveState: function(cb){
    stateStorage.save(this.storeName, this._state, cb)
  },
  loadState: function(cb){
    stateStorage.load(this.storeName, (err,state) => {
      if(cb) cb(err, state)
    })
  }
})

module.exports = Store
