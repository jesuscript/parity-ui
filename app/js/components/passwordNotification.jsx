var React = require("react")

var appActions = require("../actions/appActions")

module.exports = React.createClass({
  getInitialState: function(){
    return {
      password: ""
    }
  },
  render: function(){
    if(this.props.tx || this.props.account){
      return (
        <div className="tx-password-notification toolbar-notification">
          <form className="form-inline" onSubmit={this._onSubmit}>
            <button className="btn btn-default-strong" type="submit">
              OK
            </button>
            <div className="form-group">
              <input type="password"
                     className="form-control"
                     placeholder="password"
                     name="password"
                     value={this.state.password}
                     onChange={this._onChange}/>
            </div>
          </form>
          <span >
            for {(this._mode() === "tx") ? this.props.tx.from : this.props.account}
          </span>
          <span className="icon icon-cancel-squared pull-right" onClick={this._onCloseClick}></span>
        </div>
      )  
    } else {
      return false
    }
  },
  _onSubmit: function(e){
    e.preventDefault()

    appActions.submitPassword(this.state.password,
                              this._mode(),
                              (this._mode() === "tx") ? this.props.tx : this.props.account)
  },
  _onCloseClick: function(e){
    e.preventDefault()

    appActions.dismissTx()
  },
  _onChange: function(e){
    this.setState({password: e.target.value})
  },
  _mode: function(){

    if(this.props.tx){
      return "tx"
    }else if(this.props.account){
      return "unlock"
    }


    return false
  }
})

