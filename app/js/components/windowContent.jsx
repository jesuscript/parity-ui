var React = require("react")

var MainSidebar = require("./mainSidebar.jsx"),
    uiConstants = require("../constants/uiConstants")

module.exports = React.createClass({
  getInitialState: function(){
    return {
      activeContextItem: uiConstants.CONTEXT_ITEM_ACCOUNTS,
      contextItems: [
        {title: "Accounts", name: uiConstants.CONTEXT_ITEM_ACCOUNTS, icon: "users"},
        {title: "Send transaction", name: uiConstants.CONTEXT_ITEM_SEND_TX, icon: "mail"}
      ]
    }
  },
  render: function(){
    return (
      <div id="windowContent" className="window-content">
        <div className="pane-group pane-default">
          <MainSidebar menuItems={this.state.contextItems}
                       activeItem={this.state.activeContextItem}
                       onSelect={this._onContextItemSelect}/>
          <div className="pane">...</div>
        </div>
      </div>
    )
  },
  _onContextItemSelect: function(item){
    
  }
})
