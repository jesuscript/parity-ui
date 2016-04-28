var React = require("react");

module.exports = React.createClass({
  render: function(){
    if(this.props.error){
      return (
        <div className="error-notification">
          <p className="pull-left">
            Oops! Something went wrong
          </p>
          <span className="icon icon-cancel-squared pull-right"></span>
        </div>
      )  
    } else {
      return false
    }
    
  }
})
