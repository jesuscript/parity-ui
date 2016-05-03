var spawn = require("child_process").spawn,
    express = require("express"),
    expandHomeDir = require('expand-home-dir'),
    coffeeScript = require("coffee-script"),
    exec = require("child_process").exec,
    ipcMain = require("electron").ipcMain,
    _ = require("lodash")

var Parity = function(opt){
  this.opt = _.extend({}, this.defaultOpt, opt)

  var args = _.flatten(
    _.map(this.opt, function(v, k){

      return {
        rpc: v ? "-j" : "",
        rpcPort: ["--rpcport", v],
        chain: ["--chain", v],
        datadir: ["--datadir", v]
      }[k] || ""
    })
  )

  console.log("starting parity with:", args)
  this.clientProcess = spawn("parity", args)

  this.clientProcess.stdout.on("data", processStd)
  this.clientProcess.stderr.on("data", processStd)

  process.on('exit', () => {
    this.terminate();
  });
}

_.extend(Parity.prototype, {
  defaultOpt: {
    rpc: true,
    chain: "morden",
    datadir: expandHomeDir("~/.parity"),
    rpcPort: "7545"
  },
  start: function(opt){

    //this.startFakeRpc("8545")
  },
  terminate: function(){
    this.clientProcess.kill()
  },
  restart: function(opt){
    this.terminate()
    this.start(opt)
  },
  startFakeRpc: function(port){
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
      this.proxy.send("rpcRequest",req.body,function(res){
        console.log("res", res);
        res.send()
      })
    })

    this.server = app.listen(port, function(){
      console.log("Fake RPC listening on port",port);
    })
  },
  fetchVersion: function(cb){
    exec("parity -v", (err, stdout, stderr) => {
      var version;
      
      if(stdout){
        _.each(stdout.split("\n"), (s) => {
          var match = s.match(/version\sParity([^\s]*)/);

          if(match) version = match[1].split("/")[1];
          if(match) ;
        });
      }

      cb(err, version);
    })
  }
});

function processStd(data){
  var str = data.toString()

  console.log(str);
}

module.exports = Parity
