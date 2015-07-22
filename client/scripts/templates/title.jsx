var React = require("react");
var helper = require("../helpers/query-params.jsx");
var Title = React.createClass({
	render: function(){
		if(helper.getRoom()){
			return false;
		}
		return(
			<div className="row">
				<div className="large-12 columns mainContainer">
					<h1 className='title'>ReactChat</h1>
					<p>Welcome to reactchat.tk, a clone of Hack.Chat built with react. Channels are created
					and joined by going to http://reactchat.tk/?your-channel. There are no channel lists, so a secret channel name can be used for private discussions.</p>
					<p>Here are some pre-made channels you can join: <a href="?lobby">?lobby</a> <a href="?random">?random</a> <a href="?technology">?technology</a> 
					<a href="?programming"> ?programming</a></p> 
				</div>
			</div>
			)
	}
});


module.exports = Title;