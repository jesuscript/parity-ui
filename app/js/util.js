var http = require("http")

module.exports = {
  ping(hostname, port, cb){
    var req = http.request({
      hostname,
      port,
      method: "POST"
    }, (res) =>{ cb(null, true) })

    req.on("error", (e)=>{ cb(null,false) })

    req.end()
  }
}
