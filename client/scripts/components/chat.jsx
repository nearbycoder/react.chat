var React = require("react");
var Chat = require("./chat.jsx");

var helper = require("../helpers/query-params.jsx");
var Chat = React.createClass({
	render: function(){
		return(
			<div>
				<div className="small-12 large-12 columns userChat">
					<a title={this.props.time} className="userName small-2 large-2 columns">
					{this.props.userName}
					</a>
					<pre className="large-9 small-9 columns userMessage">
						 <code>{this.props.children}</code>
					</pre>
				</div>
			</div>
		)
	}
});


module.exports = Chat;