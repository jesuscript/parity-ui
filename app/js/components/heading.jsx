var React = require("react"),
    $ = require("jquery"),
    remote = require("remote"),
    Menu = remote.require("menu"),
    MenuItem = remote.require("menu-item")


module.exports = React.createClass({
  getInitialState: function(){
    return {
      uiVersion: "",
      clientVersion: ""
    }
  },
  componentWillReceiveProps: function(newProps){
    if(newProps.version) this.setState(_.extend({}, this.state, newProps.version));
  },
  render: function(){
    return(
      <div id="heading" className="toolbar toolbar-header">
        <div className="toolbar-actions">
          <div className="btn-group">
            <button className="btn btn-default">
              <span className="icon icon-left-open-big"></span>
            </button>
            <button className="btn btn-default" disabled>
              <span className="icon icon-right-open-big"></span>
            </button>
          </div>
          <button className="btn btn-default btn-dropdown pull-right" onClick={this.settingsClick}>
            <span className="icon icon-cog"></span>
          </button>
        </div>
      </div>
    )
  },
  settingsClick: function(e){
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
  }
})
