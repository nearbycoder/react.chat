var React = require("react");
var Chat = require("./chat.jsx");
var $ = require("jquery");
var helper = require("../helpers/query-params.jsx");
var Chat = React.createClass({
	tagUser: function(){
		var username = '@' + this.props.userName;
		$('.chat').val($('.chat').val()+username).focus();
	},
	render: function(){
		return(
			<div>
				<div className="small-12 large-12 columns userChat">
					<a title={this.props.time} className="userName small-1 large-2 columns largeName" onClick={this.tagUser}>
					{this.props.userName}
					</a>
					<pre className="large-9 medium-9 small-12 columns userMessage">
						<a title={this.props.time} className="smallName" onClick={this.tagUser}>
							{this.props.userName} 
						</a>
						<code>{this.props.children}</code>
					</pre>
				</div>
			</div>
		)
	}
});


module.exports = Chat;