var React = require("react")

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
    console.log("heading render", this.state);
    
    return(
      <div id="heading">
        <h1>Parity</h1>
        <h3>Version</h3>
        <p>
          <span class="strong">UI:</span> {this.state.uiVersion}
        </p>
        <p class="version">
          <span class="strong">Parity:</span> {this.state.clientVersion}
        </p>
      </div>
    )
  }
})
