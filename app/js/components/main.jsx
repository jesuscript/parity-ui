var React = require('react'),
    ReactDom = require('react-dom'),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    exec = remote.require("child_process").exec;

var StoreProxy = require("../storeProxy"),
    Heading = require("./heading.jsx"),
    ErrorNotification = require("./errorNotification.jsx"),
    PasswordNotification = require("./passwordNotification.jsx"),
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
    this.registerStore("eth")
    this.registerStore("ui")
  },
  render: function(){
    return(
      <div className="window">
        <Heading version={this.state.eth.version} ui={this.state.ui}/>
        <ErrorNotification/>
        <MainContent ui={this.state.ui} eth={this.state.eth}/>
        <PasswordNotification tx={(this.state.eth.pendingTxs || [])[0]}
                              account={this.state.eth.accountToUnlock} />
        <Footer clientState={this.state.eth.clientState}
                currentBlock={this.state.eth.currentBlock}
                highestBlock={this.state.eth.highestBlock}
                />
      </div>
    ) 
  },
  registerStore: function(name){
    var store = new StoreProxy(name)
    
    store.addChangeListener(()=>{
      this.onChange(name, store)
    })
    
    if(store.state) this.onChange(name,store)
  },
  onChange: function(name, store){
    var newState = {}

    newState[name] = store.state

    this.setState(newState)
  }
});

module.exports = function(){
  ReactDom.render(<Main/>, $('#react-root')[0]);
};
