var _ = require("lodash")

var Store = require("./store"),
    messages = require("../../app/js/constants/messages"),
    uiMessages = require("../../app/js/constants/uiMessages"),
    ethMessages = require("../../app/js/constants/ethMessages"),
    uiConstants = require("../../app/js/constants/uiConstants")


module.exports = class UiStore extends Store {
  get storeName(){ return "uiStore" }
  constructor(){
    super()
  }
  get listen(){
    return  [{
      source: messages.USER_ACTION,
      actions:[{
        actionType: uiMessages.SET_CONTEXT,
        handler: function(payload){
          this.setContext(payload.action.context, payload.action.scope)
        }
      },{
        actionType: uiMessages.MOVE_CONTEXT_BACK,
        handler: function(payload){
          this.moveContextBack()
        }
      },{
        actionType: uiMessages.MOVE_CONTEXT_FORWARD,
        handler: function(payload){
          this.moveContextForward()
        }
      }]
    },{
      source: messages.ETH_ACTION,
      actions:[{
        actionType: ethMessages.TX_SENT,
        handler: function(payload, cb){
          this.setContext(uiConstants.CONTEXT_ITEM_TXS, payload.action.txHash)
        }
      }]
    }]
  }
  setContext(context, scope){
    var state = this.getState()

    if((state.activeContext !== context) || (state.activeScope !== scope)){
      var contextState = {
        activeContext: context,
        activeScope: scope
      }

      var contextHistory = state.contextHistory.slice(0,state.contextIndex+1)

      contextHistory.push(contextState)

      this.updateContext(contextHistory, contextHistory.length - 1)
    }
  }
  moveContextBack(){
    this.moveContext(-1)
  }
  moveContextForward(){
    this.moveContext(1)
  }
  moveContext(i){
    var state = this.getState()

    var contextIndex = state.contextIndex + i
    
    if((contextIndex >= 0) && (contextIndex < state.contextHistory.length)){
      this.updateContext(state.contextHistory, contextIndex)
    }
  }
  updateContext(contextHistory, contextIndex){
    this.updateState(_.extend({contextHistory, contextIndex}, contextHistory[contextIndex]))
  }
}


