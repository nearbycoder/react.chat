var React = require("react");
var Chat = require("./chat.jsx");
var helper = require("../helpers/query-params.jsx");
var ChatInput = require("./chatinput.jsx");
var ChatBox = React.createClass({
	getInitialState: function() {
		return {
			messages: [{user: 'ted', message: 'hellow World'},
								 {user: 'ted', message: 'hellow World'},
								 {user: 'nearbygamer', message: 'how you ever going to know'}]
		};
	},
	componentDidUpdate: function(nextProps) {
	  console.log('next');
	},
	eachChat: function(message, i) {
		return (
			<Chat 
				index={i}
				userName={message.user}
			>{message.message}</ Chat>
		)
	},
	addMessage: function(message){
				console.log(this.state)
       this.setState({messages: this.state.messages.concat({user : 'josh', message: message})});
   },
	render: function(){
		return(
			<div className="row">
			{this.state.messages.map(this.eachChat)}
			<ChatInput onKeyDown={this.addMessage}/>
			</div>
		)
	}
});


module.exports = ChatBox;