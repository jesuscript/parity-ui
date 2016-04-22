var React = require('react'),
    ReactDom = require('react-dom'),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    exec = remote.require("child_process").exec;

var parityStore = require("../stores/parityStore"),
    Heading = require("./heading.jsx")

var Main = React.createClass({
  getInitialState: function(){
    return {
      parity: {}
    }
  },
  componentDidMount: function() {
    var onChange = this.onChange.bind(this, "parity")
    parityStore.addChangeListener(onChange)
    parityStore.getState(onChange)
  },
  render: function(){
    return(
      <div class="main">
        <Heading version={this.state.parity.version}/>
      </div>
    ) 
  },
  onChange: function(name, state){
    var newState = {}
    newState[name] = state

    console.log("onchange", newState);
    this.setState(newState)
  }
});

module.exports = function(){
  ReactDom.render(<Main/>, $('#react-root')[0]);
};
