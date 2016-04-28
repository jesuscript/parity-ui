var React = require("react"),
    _ = require("lodash")

module.exports = React.createClass({
  _onItemClick: function(item, e){
    e.preventDefault()
    this.props.onSelect(item);
  },
  render: function(){
    var buildItems = (items) =>{
      return _.map(items, (item,i) =>{
        var className = `nav-group-item ${(this.props.activeItem == item.name) ? "active" : ""}`,
            iconClass = `icon icon-${item.icon} icon-default`

        return (
          <a className={className} key={i} onClick={this._onItemClick.bind(this,item.name)}>
            <span className={iconClass}></span>
            {item.title}
          </a>
        )
      }) 
    }
    var mainItems = buildItems(_.filter(this.props.menuItems, {type: "main"})),
        pluginItems = buildItems(_.filter(this.props.menuItems, {type: "plugin"}))
    
    return (
      <div className="main-sidebar pane-sm sidebar">
        <h5 className="nav-group-title">Main</h5>
        <nav className="nav-group">
          {mainItems}
        </nav>
        <h5 className="nav-group-title">Plugins</h5>
        <nav className="nav-group">
          {pluginItems}
        </nav>
      </div>
    )
  }
})
