var fs = require("fs"),
    path = require("path")

module.exports = {
  start: function(datadir){
    this.stateDir = path.join(datadir, "states")
    
    if(!fs.existsSync(this.stateDir)) fs.mkdirSync(this.stateDir)
  },
  save: function(name, state, cb){
    fs.writeFile(path.join(this.stateDir, name), JSON.stringify(state), cb)
  },
  load: function(name, cb){
    fs.readFile(path.join(this.stateDir, name), function(err, content){
      cb(err, content ? JSON.parse(content) : {})
    })
  }
}
