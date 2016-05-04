var React = require('react'),
    ReactDom = require('react-dom'),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    exec = remote.require("child_process").exec;

var StoreProxy = require("../stores/storeProxy"),
    Heading = require("./heading.jsx"),
    ErrorNotification = require("./errorNotification.jsx"),
    PasswordNotification = require("./passwordNotification.jsx"),
    Footer = require("./footer.jsx"),
    MainContent = require("./mainContent.jsx"),
    appActions = require("../actions/appActions"),
    uiConstants = require("../constants/uiConstants")

var Main = React.createClass({
  getInitialState: function(){
    return {
      eth: {},
      ui: {}
    }
  },
  componentDidMount: function() {
    this.registerStore("Eth")
    this.registerStore("Ui")
  },
  render: function(){
    return(
      <div className="window">
        <Heading version={this.state.eth.version} ui={this.state.ui}/>
        <ErrorNotification/>
        <MainContent ui={this.state.ui} eth={this.state.eth}/>
        <PasswordNotification tx={ ((this.state.eth.pendingTxs || [])[0] || {}).tx }
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

    name = name.toLowerCase()
    
    store.addChangeListener(()=>{
      this.onChange(name, store)
    })
    
    if(store.state) this.onChange(name,store)
  },
  onChange: function(name, store){
    var newState = {}

    if(name === "eth") this._onEthChange(store.state)

    newState[name] = store.state

    this.setState(newState)
  },
  _onEthChange: function(newState){
    if(this.state.eth){
      _.each(this.state.eth.unconfirmedTxs, (utx, hash) =>{
        var tx = newState.transactions[hash]
        if(tx && tx.blockNumber){
          var notification = new Notification("Transaction confirmed", {
            body: tx.hash
          })

          notification.onclick = function(){
            appActions.setContext(uiConstants.CONTEXT_ITEM_TXS, tx.hash)
          }
          
        }
      })
    }
  }
});

module.exports = function(){
  ReactDom.render(<Main/>, $('#react-root')[0]);
};
