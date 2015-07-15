var React = require("react");
var Chat = require("./chat.jsx");
var $ = require("jquery");
var helper = require("../helpers/query-params.jsx");
var ChatInput = require("./chatinput.jsx");


var ChatBox = React.createClass({
	getInitialState: function() {
		return {
			messages: []
		};
	},
	componentWillMount: function() {
		if(helper.getParameterByName("room") && !localStorage.getItem('nickName')){
			var nickName = prompt("Please enter nickname");
			if (nickName != null) {
			    localStorage.setItem('nickName', nickName);
			}
		}
	},
	componentDidUpdate: function(nextProps) {
		if(this.scroll){
    		$('html, body').scrollTop( $(document).height() );
    	}
	},
	eachChat: function(message, i) {
		return (
			<Chat
				index={i}
				key={i}
				userName={message.user}
			>{message.message}</ Chat>
		)
	},
	addMessage: function(message){
		var nickName = localStorage.getItem('nickName');
		if(!nickName){
			var nickName = prompt("Please enter nickname");
			if (nickName != null) {
			    localStorage.setItem('nickName', nickName);
			}
		}else{
			if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
		    this.scroll = true;
		   } else {
		   	this.scroll = false;
		   }
    	this.setState({messages: this.state.messages.concat({user : nickName, message: message})});
    }
  },
	render: function(){
		if(!helper.getParameterByName("room")){
			return false;
		}
		return(
			<div>
				<div className="row">
					<div className="large-12 columns mainContainer">
					{this.state.messages.map(this.eachChat)}
					</div>
				</div>
			<ChatInput onKeyDown={this.addMessage}/>
			</div>
		)
	}
});


module.exports = ChatBox;