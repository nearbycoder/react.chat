var React = require("react");
var Chat = require("./chat.jsx");
var helper = require("../helpers/query-params.jsx");
var Chat = React.createClass({
	render: function(){
		return(
			<div>
				<div className="small-12 large-12 columns userChat">
					<div className="userName small-3 large-3 columns">
					{this.props.userName}
					</div>
					<div className="large-6 small-6 columns userMessage">
						 {this.props.children}
					</div>
				</div>
			</div>
		)
	}
});


module.exports = Chat;