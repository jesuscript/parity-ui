var React = require("react"),
    _ = require("lodash"),
    $ = require("jquery"),
    remote = require("remote"),
    Menu = remote.require("menu"),
    MenuItem = remote.require("menu-item")

var appActions = require("../actions/appActions")

module.exports = React.createClass({
  getInitialState: function(){
    return {
      uiVersion: "",
      clientVersion: ""
    }
  },
  componentWillReceiveProps: function(newProps){
    if(newProps.version) this.setState(_.extend({}, this.state, newProps.version));

    if(newProps.ui.contextHistory){
      this.setState({
        canMoveBack: newProps.ui.contextIndex > 0,
        canMoveForward: newProps.ui.contextIndex < newProps.ui.contextHistory.length - 1
      })
    }
  },
  render: function(){
    return(
      <div id="heading" className="toolbar toolbar-header">
        <div className="toolbar-actions">
          <div className="btn-group">
            <button className="btn btn-default"
                    disabled={!this.state.canMoveBack}
                    onClick={this._backClick}>
              <span className="icon icon-left-open-big"></span>
            </button>
            <button className="btn btn-default"
                    disabled={!this.state.canMoveForward}
                    onClick={this._forwardClick}>
              <span className="icon icon-right-open-big"></span>
            </button>
          </div>
          <input type="text" className="search" placeholder="Search"/>
          <button className="btn btn-default btn-dropdown pull-right" onClick={this._settingsClick}>
            <span className="icon icon-cog"></span>
          </button>
        </div>
      </div>
    )
  },
  _settingsClick: function(e){
    var self = this;
    e.preventDefault();

    var menu = new Menu()
    menu.append(new MenuItem({
      label: "About",
      click: function() {
        // Trigger an alert when menu item is clicked
        alert("Parity UI: " + self.state.uiVersion + "\nParity: " + self.state.clientVersion)
      }
    }))

    menu.popup(remote.getCurrentWindow())
  },
  _backClick: function(e){
    appActions.moveContextBack()
  },
  _forwardClick: function(e){
    appActions.moveContextForward()
  }
})
