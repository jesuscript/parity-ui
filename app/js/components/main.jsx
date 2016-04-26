var React = require('react'),
    ReactDom = require('react-dom'),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    exec = remote.require("child_process").exec;

var ethStore = require("../stores/ethStore"),
    uiStore = require("../stores/uiStore"),
    Heading = require("./heading.jsx"),
    Footer = require("./footer.jsx"),
    MainContent = require("./mainContent.jsx")

var Main = React.createClass({
  getInitialState: function(){
    return {
      eth: {},
      ui: {}
    }
  },
  componentDidMount: function() {
    this.registerStore("eth", ethStore)
    this.registerStore("ui", uiStore)
  },
  render: function(){
    return(
      <div className="window">
        <Heading version={this.state.eth.version}/>
        <MainContent ui={this.state.ui} eth={this.state.eth}/>
        <Footer clientState={this.state.eth.clientState}
                currentBlock={this.state.eth.currentBlock}
                highestBlock={this.state.eth.highestBlock}
                />
      </div>
    ) 
  },
  registerStore: function(name, store){
    store.addChangeListener(()=>{
      this.onChange(name, store)
    })
    this.onChange(name,store)
  },
  onChange: function(name, store){
    var newState = {}
    
    newState[name] = store.getState()

    this.setState(newState)
  }
});

module.exports = function(){
  ReactDom.render(<Main/>, $('#react-root')[0]);
};
