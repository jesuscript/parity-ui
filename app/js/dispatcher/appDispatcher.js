var _ = require("lodash"),
    Dispatcher = require("flux").Dispatcher,
    util = require("util")

var messages = require("../constants/messages")
    
module.exports = _.extend(new Dispatcher(), {
  userAction: function(action){
    this.dispatch({
      source: messages.USER_ACTION,
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




