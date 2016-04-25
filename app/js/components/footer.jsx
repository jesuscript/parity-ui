var React = require("react"),
    _ = require("lodash"),
    parityMessages = require("../constants/parityMessages")


module.exports = React.createClass({
  render: function(){

    var clientState = "Disconnected",
        statusName = "danger"

    if(this.props.clientState){
      ({
        "CLIENT_SYNCING": function(){
          clientState = "Syncing"
          statusName = "warning"
        },
        "CLIENT_ACTIVE": function(){
          clientState = "Active"
          statusName = "success"
        },
        "CLIENT_DISCONNECTED": function(){
          clientState = "Disconnected"
          statusName = "danger"
        }
      })[this.props.clientState]()
    }

    var blocks = "#" + (this.props.currentBlock || 0)
          
    var iconClass = `icon icon-record pull-right icon-status icon-${statusName}`,
        clientStateClass= "title pull-right",
        blockcountClass = "title pull-right blockcount"
    
    return (
      <div id="footer" className="toolbar toolbar-footer ">
        <span className={iconClass}></span>
        <p className={clientStateClass}>{clientState}</p>
        <p className={blockcountClass}>
          {blocks}
        </p>
      </div>
    )
  }
})
