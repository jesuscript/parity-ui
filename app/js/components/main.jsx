var React = require('react'),
    ReactDom = require('react-dom'),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    exec = remote.require("child_process").exec;

var Main = React.createClass({
  getInitialState: function() {
    return {version: ""}
  },
  componentDidMount: function() {
    this.setState({ uiVersion: remote.require("./package.json").version});

    //TODO: fail on missing parity
    exec("parity -v", (err, stdout, stderr) => {
      if(err) throw err;
      if(stdout){
        _.each(stdout.split("\n"), (s) => {
          var match = s.match(/version\sParity([^\s]*)/);

          if(match) this.setState({clientVersion: match[1].split("/")[1]});
        });
      }
    })
  },
  render: function(){
    
    return(
      <div class="main">
        <h1>Clarity</h1>
        <p>
          <span class="strong">UI:</span> {this.state.uiVersion}
        </p>
        <p class="version">
          <span class="strong">Parity:</span> {this.state.clientVersion}
        </p>
      </div>
    ) 
  }
});

module.exports = function(){
  ReactDom.render(<Main/>, $('#react-root')[0]);
};
