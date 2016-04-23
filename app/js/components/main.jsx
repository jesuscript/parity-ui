var React = require('react'),
    ReactDom = require('react-dom'),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    exec = remote.require("child_process").exec;

var parityStore = require("../stores/parityStore"),
    Heading = require("./heading.jsx"),
    Footer = require("./footer.jsx"),
    WindowContent = require("./windowContent.jsx")

var Main = React.createClass({
  getInitialState: function(){
    return {
      parity: {}
    }
  },
  componentDidMount: function() {
    var onChange = this.onChange.bind(this, "parity", parityStore)
    parityStore.addChangeListener(onChange)
    parityStore.getState(onChange)
  },
  render: function(){
    return(
      <div className="window">
        <Heading version={this.state.parity.version}/>
        <WindowContent/>
        <Footer clientState={this.state.parity.clientState}
                currentBlock={this.state.parity.currentBlock}
                highestBlock={this.state.parity.highestBlock}
                />
      </div>
    ) 
  },
  onChange: function(name, store, state){
    var newState = {}
    newState[name] = store.getState()

    this.setState(newState)
  }
});

module.exports = function(){
  ReactDom.render(<Main/>, $('#react-root')[0]);
};
