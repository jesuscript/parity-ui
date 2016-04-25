var React = require("react"),
    _ = require("lodash")

module.exports = React.createClass({
  getInitialState: function(){
    return {
      activeItem: this.props.activeItem
    }
  },
  _onItemClick: function(e){
    e.preventDefault()

    this.props.onSelect();
  },
  render: function(){
    var menuItems = _.map(this.props.menuItems, (item) =>{
      var className = `nav-group-item ${(this.state.activeItem == item.name) ? "active" : ""}`,
          iconClass = `icon icon-${item.icon} icon-default`
      
      return (
        <a className={className} key={item.name} onClick={this._onItemClick}>
          <span className={iconClass}></span>
          {item.title}
        </a>
      )
    })
    return (
      <div className="main-sidebar pane-sm sidebar">
        <h5 className="nav-group-title">Main</h5>
        <nav className="nav-group">
          {menuItems}
        </nav>
      </div>
    )
  }
})
