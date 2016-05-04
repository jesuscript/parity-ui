var fs = require("fs"),
    path = require("path")

module.exports = {
  initDir: function(datadir){
    this.stateDir = path.join(datadir, "states")
    
    if(!fs.existsSync(this.stateDir)) fs.mkdirSync(this.stateDir)
  },
  save: function(name, state, cb){
    fs.writeFile(path.join(this.stateDir, name), JSON.stringify(state), cb)
  },
  load: function(name, cb){
    fs.readFile(path.join(this.stateDir, name), function(err, content){
      if(err) console.warn(err)
      
      cb(null, content ? JSON.parse(content) : {})
    })
  }
}
