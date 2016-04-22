"use strict"
const messages = require('../constants/messages')
const Serializer = require('../dispatcher/serializer')

class AppDispatcher {
  dispatch (action) {
    if (process.type === 'renderer') {
      require('electron').ipcRenderer.send(messages.APP_ACTION, Serializer.serialize(action))
    } else {
      process.emit(messages.APP_ACTION, action)
    }
  }
}


module.exports = new AppDispatcher()
