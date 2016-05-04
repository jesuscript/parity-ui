var express = require("express"),
    request = require("request"),
    _ = require("lodash")

var util = require("./util")

module.exports = class RpcProxy{
  constructor(opt){
    opt = _.extend({
      port: 8545,
      rpcPort: 7545
    }, opt)
    
    var app = express()
    
    app.use(function(req,res,next){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
      res.header("Access-Control-Allow-Headers",
                 "Accept, Content-Type, Authorization, X-Requested-With");
      
      next();
    });
    
    app.use(require("body-parser").json());

    app.post("/", (req,res) => {
      request.post({
        url: `http://localhost:${opt.rpcPort}`,
        json: req.body
      },function(err, r, body){
        res.send(body)
      })
    })

    var activateOnActiveRpc = () => {
      util.ping("localhost", opt.rpcPort, (err, active) => {
        if(active){
          this.server = app.listen(opt.port, function(){
            console.log("Fake RPC listening on port",opt.port);
          })
        }else{
          setTimeout(activateOnActiveRpc, 500)
        }
      })
    }

    activateOnActiveRpc()
  }
}
