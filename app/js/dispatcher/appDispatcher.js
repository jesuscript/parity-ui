var _ = require("lodash"),
    Dispatcher = require("flux").Dispatcher,
    util = require("util")

var messages = require("../constants/messages")
    
function AppDispatcher(){
  _.defaults(this,new Dispatcher())
}

util.inherits(AppDispatcher, Dispatcher)

_.extend(AppDispatcher.prototype, Dispatcher.prototype, {
  handleViewAction: function(action){
    this.dispatch({
      source: messages.VIEW_ACTION,
      action
    })
  },
  dispatch: function(payload){
    //console.log("dispatch", payload);
    if(!payload.source) throw new Error("Payload source not set!");
    if(payload.action && !payload.action.actionType){
      throw new Error("Payload "+payload.source+" action type not set!");
    }
    
    Dispatcher.prototype.dispatch.call(this,payload)
  }
})

module.exports =  new AppDispatcher()


