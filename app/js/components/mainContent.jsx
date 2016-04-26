var React = require("react")

var MainSidebar = require("./mainSidebar.jsx"),
    AccountsOverview = require("./accountsOverview.jsx"),
    SendTx = require("./sendTx.jsx"),
    uiConstants = require("../constants/uiConstants"),
    mainContentActions = require("../actions/mainContentActions")


module.exports = React.createClass({
  render: function(){
    var currentPane = ({
      "CONTEXT_ITEM_ACCOUNTS": <AccountsOverview balances={this.props.eth.balances}/>,
      "CONTEXT_ITEM_SEND_TX": <SendTx onSend={this._onTxSend} accounts={this.props.eth.accounts} defaultGas={this.props.eth.defaultGas}/>
    })[this.props.ui.activeContext]
    
    return (
      <div className="window-content main-content">
        <div className="pane-group pane-default">
          <MainSidebar menuItems={this.props.ui.contexts}
                       activeItem={this.props.ui.activeContext}
                       onSelect={this._onContextItemSelect}/>
          <div className="pane main-pane-container">{currentPane}</div>
        </div>
      </div>
    )
  },
  _onContextItemSelect: function(item){
    mainContentActions.setContext(item.name)
  },
  _onTxSend: function(data){
    mainContentActions.sendTx(data)
  }
})
