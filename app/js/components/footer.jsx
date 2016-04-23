var React = require("react"),
    _ = require("lodash"),
    parityMessages = require("../constants/parityMessages")


module.exports = React.createClass({
  render: function(){

    var clientState = "Disconnected",
        iconType = "icon-danger"
    
    if(this.props.clientState){
      ({
        "CLIENT_SYNCING": function(){
          clientState = "Syncing"
          iconType = "icon-warning"
        },
        "CLIENT_ACTIVE": function(){
          clientState = "Active"
          iconType = "icon-success"
        },
        "CLIENT_DISCONNECTED": function(){
          clientState = "Disconnected"
          iconType = "icon-danger"
        }
      })[this.props.clientState]()
    }

    
    var iconClass = "icon icon-record pull-right icon-status " + iconType

    var blocks = "#" + (this.props.currentBlock || 0)+ " / " +(this.props.highestBlock || 0)
          
    return (
      <div id="footer" className="toolbar toolbar-footer ">
        <p className="title pull-left">
          {blocks}
        </p>
        <span className={iconClass}></span>
        <p className="title pull-right">{clientState}</p>
      </div>
    )
  }
})
