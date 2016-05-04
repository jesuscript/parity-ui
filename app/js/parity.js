var spawn = require("child_process").spawn,
    expandHomeDir = require('expand-home-dir'),
    coffeeScript = require("coffee-script"),
    exec = require("child_process").exec,
    _ = require("lodash")

module.exports = class Parity {
  get defaultOpt(){
    return {
      rpc: true,
      chain: "morden",
      datadir: expandHomeDir("~/.parity"),
      rpcPort: 8545
    }
  }
  constructor(opt){
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
  terminate(){
    console.log("terminating parity...");
    this.clientProcess.kill()
  }
  restart(opt){
    this.terminate()
    this.start(opt)
  }
  fetchVersion(cb){
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

}

function processStd(data){
  var str = data.toString()

  console.log(str);
}


