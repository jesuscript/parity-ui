var appDispatcher = require("../dispatcher/appDispatcher"),
    uiMessages = require("../constants/uiMessages")


module.exports = {
  setContext: function(name){
    appDispatcher.userAction({
      actionType: uiMessages.SET_CONTEXT,
      name
    })
  },
  sendTx: function(tx){
    appDispatcher.userAction({
      actionType: uiMessages.SEND_TX,
      tx
    })
  }
}
