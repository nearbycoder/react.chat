var React = require("react");
var Chat = require("./chat.jsx");
var $ = require("jquery");
var helper = require("../helpers/query-params.jsx");
var ChatInput = require("./chatinput.jsx");
var io = require("socket.io-client");
var socket = io('http://127.0.0.1:6060');
var _room = helper.getRoom("room");
var highlight = require("highlight.js");

var ChatBox = React.createClass({
	getInitialState: function() {
		return {
			messages: []
		};
	},
	componentWillMount: function() {
		var _this = this;
		if(_room && !localStorage.getItem('nickName')){
			var nickName = prompt("Please enter nickname");
			if (nickName != null && nickName != "") {
			    localStorage.setItem('nickName', nickName);
			}
		}
		//show user joined status after checking server for username duplicates
		socket.emit('join', _room, localStorage.getItem('nickName'));

		//message room io.emit('message', room, nickname, message,  time);
		socket.on('message', function(room, user, message, time){
			if($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
		    this.scroll = true;
		   } else {
		   	this.scroll = false;
		   }
			if(room == _room){
		  _this.setState({messages: _this.state.messages.concat({user : user, message: message, time: time})});
			}
		});

		//prompt user if username already is in room io.emit('user.prompt');
		socket.on('user.prompt', function(){
			if(localStorage.getItem('nickName')){
				var oldNick = localStorage.getItem('nickName');
			}
			var nickName = prompt("Nickname already exists please enter another one?");
			if (nickName != null) {
			    localStorage.setItem('nickName', nickName);
			    socket.emit('join', _room, localStorage.getItem('nickName'), oldNick);
			}
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('user.join', function(room, nickName, time, oldNick){
			//if new user to room
			if(room == _room && oldNick == null){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: nickName + " has joined", time: time})});
		  }
		  //if user changed name
		  if(oldNick){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: oldNick + " is now " + nickName, time: time})});
		  }
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('getUserList', function(userList, time){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: "current users in room " + userList, time: time})});
		});

		//disconnect user and send disconnect notice to state socket.on('disconnect', function(room,user));
		socket.on('disconnect', function(room, user, time){
			if(room == _room){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: user + " has left", time: time})});
		  }
		});
	},
	componentDidUpdate: function(nextProps) {
		if(this.scroll){
    	$('html, body').scrollTop( $(document).height() );
    }
    highlight.highlightBlock($( "code:last" ).get(0));


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
		  socket.emit('message', _room, nickName, message);
    }
  },
	render: function(){
		if(!_room){
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