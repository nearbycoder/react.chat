var React = require("react");
var Chat = require("./chat.jsx");

var helper = require("../helpers/query-params.jsx");
var Chat = React.createClass({
	render: function(){
		return(
			<div>
				<div className="small-12 large-12 columns userChat">
					<div className="userName small-2 large-2 columns">
					{this.props.userName}
					</div>
					<pre className="large-9 small-9 columns userMessage">
						 {this.props.children}
					</pre>
				</div>
			</div>
		)
	}
});


module.exports = Chat;