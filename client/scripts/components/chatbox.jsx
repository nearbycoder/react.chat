var React = require("react");
var Chat = require("./chat.jsx");
var $ = require("jquery");
var helper = require("../helpers/query-params.jsx");
var ChatInput = require("./chatinput.jsx");
var io = require("socket.io-client");
var socket = io('http://127.0.0.1:6060');
var moment = require("moment");
var _room = helper.getParameterByName("room");

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
			if (nickName != null) {
			    localStorage.setItem('nickName', nickName);
			}
		}
		//show user joined status after checking server for username duplicates
		socket.emit('join', _room, localStorage.getItem('nickName'), moment().format('MMMM Do YYYY, h:mm:ss a'));

		//message room io.emit('message', room, nickname, message,  time);
		socket.on('message', function(room, user, message, time){
			if(room == _room){
		  _this.setState({messages: _this.state.messages.concat({user : user, message: message, time: time})});
			}
		});

		//prompt user if username already is in room io.emit('user.prompt');
		socket.on('user.prompt', function(){
			var nickName = prompt("Nickname already exists please enter another one?");
			if (nickName != null) {
			    localStorage.setItem('nickName', nickName);
			    socket.emit('join', _room, localStorage.getItem('nickName'), moment().format('MMMM Do YYYY, h:mm:ss a'));
			}
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('user.join', function(room, nickName, time){
			if(room == _room){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: nickName + " has joined", time: time})});
		  }
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('getUserList', function(userList){
			console.log(userList)
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: "current users in room " +userList, time: moment().format('MMMM Do YYYY, h:mm:ss a')})});
		});

		//disconnect user and send disconnect notice to state socket.on('disconnect', function(room,user));
		socket.on('disconnect', function(room, user){
			if(room == _room){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: user + " has left", time: moment().format('MMMM Do YYYY, h:mm:ss a')})});
		  }
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
		  socket.emit('message', _room, nickName, message, time);
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