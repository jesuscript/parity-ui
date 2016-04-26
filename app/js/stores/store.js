var _ = require("lodash"),
    EventEmitter = require("events").EventEmitter

var appDispatcher = require("../dispatcher/appDispatcher")

var CHANGE_EVENT = "parity-state-change"

var Store = function(){
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

    if(handler) handler.call(this, payload,this.emitChanges.bind(this))
  })
}

_.extend(Store.prototype, EventEmitter.prototype, {
  listen: [],
  getState: function(cb){
    return _.cloneDeep(this._state)
  },
  setState: function(state){
    this._state = state
    this.emitChanges();
  },
  updateState: function(changes){
    this.setState(_.merge({}, this._state, changes))
  },
  emitChanges: _.debounce(function(){
    this.emit(CHANGE_EVENT)
  },5),
  addChangeListener: function(cb){
    this.on(CHANGE_EVENT, cb)
  },
  removeChangeListener: function(cb){
    this.removeListener(CHANGE_EVENT, cb)
  }
})


module.exports = Store
