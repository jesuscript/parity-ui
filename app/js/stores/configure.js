var messages = require("../constants/messages")


module.exports = {
  Eth: Base => class extends Base {
    get storeName(){ return "ethStore" }
    get changeEventMessage() { return messages.ETH_STORE_CHANGE }
    get getStateMessage() { return messages.ETH_STORE_GET_STATE }
  },
  Ui: Base => class extends Base {
    get storeName(){ return "uiStore" }
    get changeEventMessage() { return messages.UI_STORE_CHANGE }
    get getStateMessage() { return messages.UI_STORE_GET_STATE }
  }
}
