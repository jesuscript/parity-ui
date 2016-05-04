var express = require("express"),
    EventEmitter = require("events").EventEmitter,
    request = require("request"),
    _ = require("lodash")

var util = require("./util")

module.exports = class RpcProxy extends EventEmitter {
  constructor(opt){
    super()
    
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
      this.emit("request", req)

      if(req.body.method === "eth_sendTransaction"){
        console.log(req.body);
        this.emit("sendTransaction", {
          tx: req.body.params[0],
          resolve: (err, hash)=>{
            res.send({
              jsonrpc: "2.0",
              id: req.body.id,
              result: hash
            })
          }
        })
      }else{
        request.post({
          url: `http://localhost:${opt.rpcPort}`,
          json: req.body
        },function(err, r, body){
          if(err){
            console.log("rpcproxy request", err);
          }else{
            res.send(body)
          } 
        })
      }
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
