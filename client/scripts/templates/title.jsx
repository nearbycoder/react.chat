var React = require("react");
var helper = require("../helpers/query-params.jsx");
var Title = React.createClass({
	render: function(){
		if(helper.getParameterByName("?")){
			return false;
		}
		return(
			<div className="row">
				<div className="large-12 columns mainContainer">
					<h1 className='title'>ReactChat</h1>
					<p>Welcome to reactchat.tk, a minimal, distraction-free chat application.Channels are created
					and joined by going to https:\/\/reactchat.tk/?your-channel. There are no channel lists, so a secret channel name can be used for private discussions.</p>
					<p>Here are some pre-made channels you can join:?lobby ?meta ?random?technology ?programming?math ?physics ?asciiart 
					And here&#39;s a random one generated just for you: ?sqrudtj5</p>
				</div>
			</div>
			)
	}
});


module.exports = Title;