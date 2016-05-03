var _ = require("lodash"),
    Dispatcher = require("flux").Dispatcher


var messages = require("../constants/messages")

module.exports = _.extend(new Dispatcher(), {
  userAction: function(action){
    this.dispatch({
      source: messages.USER_ACTION,
      action
    })
  },
  appAction: function(action){
    this.dispatch({
      source: messages.APP_ACTION,
      action
    })
  },
  dispatch: function(payload){
    if(!payload.source) throw new Error("Payload source not set!");
    if(payload.action && !payload.action.actionType){
      throw new Error("Payload "+payload.source+" action type not set!");
    }
    
    if(process.type === "renderer"){
      require("electron").ipcRenderer.send(messages.DISPATCHER_MESSAGE, payload)
    }else{
      Dispatcher.prototype.dispatch.call(this,payload)
    }
  }
})




