var spawn = require("child_process").spawn,
    EventEmitter = require("events").EventEmitter,
    coffeeScript = require("coffee-script"),
    exec = require("child_process").exec,
    _ = require("lodash")

var clientProcess

var parity = _.extend({}, EventEmitter.prototype, {
  defaultOpt: {
    rpc: true
  },
  start: function(opt){
    var mergedOpt = _.extend({}, parity.defaultOpt, opt)
    
    var args = _.flatten(
      _.map(mergedOpt, function(v, k){
        return {
          rpc: v ? "-j" : ""
        }[k] || ""
      })
    )

    console.log("starting parity with:", args)
    clientProcess = spawn("parity", args)

    clientProcess.stdout.on("data", processStd)
    clientProcess.stderr.on("data", processStd)
  },
  terminate: function(){
    clientProcess.kill()

    parity.emit("running", false)
  },
  restart: function(opt){
    parity.terminate()
    parity.start(opt)
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

  if(str.match(/Starting\sParity/)){
    parity.emit("running", parity.running =true)
  } 
}


module.exports = parity
