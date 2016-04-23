var React = require("react")

module.exports = React.createClass({
  render: function(){
    return (
      <div id="windowContent" className="window-content">
        <div className="pane-group pane-default">
          <div className="pane-sm sidebar">...</div>
          <div className="pane">...</div>
        </div>
      </div>
    )
  }
})
