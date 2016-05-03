var React = require("react")

var MainSidebar = require("./mainSidebar.jsx"),
    AccountsOverview = require("./accountsOverview.jsx"),
    SendTx = require("./sendTx.jsx"),
    TxDetails = require("./txDetails.jsx"),
    TxsOverview = require("./txsOverview.jsx"),
    uiConstants = require("../constants/uiConstants"),
    appActions = require("../actions/appActions")


module.exports = React.createClass({
  render: function(){
    var currentPane = (({
      "CONTEXT_ITEM_ACCOUNTS": () => {
        return (
          <AccountsOverview balances={this.props.eth.balances} passwords={this.props.eth.passwords}/> 
        )
      }, 
      "CONTEXT_ITEM_SEND_TX": () => {
        return (
          <SendTx onSend={this._onTxSend} accounts={this.props.eth.accounts} defaultGas={this.props.eth.defaultGas}/>
        )
      },
      "CONTEXT_ITEM_TXS": (txHash) => {
        var tx = (this.props.eth.transactions || {})[txHash],
            txView

        if(txHash){
          txView = <TxDetails transaction={tx}/>
        }else{
          txView = <TxsOverview transactions={this.props.eth.transactions} onTxSelect={this._onContextSelect.bind(this, uiConstants.CONTEXT_ITEM_TXS)} />
        }

        return txView;
      }
    })[this.props.ui.activeContext] || function(){
      //default
    })(this.props.ui.activeScope)

    

    return (
      <div className="window-content main-content">
        <div className="pane-group pane-default">
          <MainSidebar menuItems={this.props.ui.contexts}
                       activeItem={this.props.ui.activeContext}
                       onSelect={this._onContextSelect}/>
          <div className="pane main-pane-container">{currentPane}</div>
        </div>
      </div>
    )
  },
  _onContextSelect: function(context, scope){
    appActions.setContext(context, scope)
  },
  _onTxSend: function(data){
    appActions.sendTx(data)
  }
})
