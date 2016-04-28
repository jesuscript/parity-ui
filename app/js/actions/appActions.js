var appDispatcher = require("../dispatcher/appDispatcher"),
    uiMessages = require("../constants/uiMessages")


module.exports = {
  setContext: function(context, scope){
    appDispatcher.userAction({
      actionType: uiMessages.SET_CONTEXT,
      context,
      scope
    })
  },
  sendTx: function(tx){
    appDispatcher.userAction({
      actionType: uiMessages.SEND_TX,
      tx
    })
  },
  moveContextBack: function(){
    appDispatcher.userAction({
      actionType: uiMessages.MOVE_CONTEXT_BACK
    })
    
  },
  moveContextForward: function(){
    appDispatcher.userAction({
      actionType: uiMessages.MOVE_CONTEXT_FORWARD
    })
  },
  submitPassword: function(password){
    appDispatcher.userAction({
      actionType: uiMessages.SUBMIT_PASSWORD,
      password
    })
  },
  dismissTx: function(tx){
    appDispatcher.userAction({
      actionType: uiMessages.DISMISS_TX
    })
  },
  unlockAccount: function(address){
    appDispatcher.userAction({
      actionType: uiMessages.UNLOCK_ACCOUNT,
      address
    })
  },
  lockAccount: function(address){
    appDispatcher.userAction({
      actionType: uiMessages.LOCK_ACCOUNT,
      address
    })
  }
}
