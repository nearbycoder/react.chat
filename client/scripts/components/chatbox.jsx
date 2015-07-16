var React = require("react");
var Chat = require("./chat.jsx");
var $ = require("jquery");
var helper = require("../helpers/query-params.jsx");
var ChatInput = require("./chatinput.jsx");
var io = require("socket.io-client");
var socket = io('http://127.0.0.1:6060');
var moment = require("moment");

var ChatBox = React.createClass({
	getInitialState: function() {
		return {
			messages: []
		};
	},
	componentWillMount: function() {
		var _this = this;
		if(helper.getParameterByName("room") && !localStorage.getItem('nickName')){
			var nickName = prompt("Please enter nickname");
			if (nickName != null) {
			    localStorage.setItem('nickName', nickName);
			}
		}
		socket.on(helper.getParameterByName("room"), function(msg){
		  _this.setState({messages: _this.state.messages.concat({user : msg.nickName, message: msg.message, time: msg.time})});
		});
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
				time={message.time}
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
		  var time = moment().format('MMMM Do YYYY, h:mm:ss a');
		  socket.emit('room', {room: helper.getParameterByName("room"), nickName: nickName, message:message, time: time});
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