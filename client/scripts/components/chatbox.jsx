var React = require("react");
var Chat = require("./chat.jsx");
var config = require("../config/config.jsx");
var $ = require("jquery");
var helper = require("../helpers/query-params.jsx");
var ChatInput = require("./chatinput.jsx");
var io = require("socket.io-client");
var socket = io(config.socketUrl);
var _room = helper.getRoom("room");
var highlight = require("highlight.js");
var missed = 0;
var oldNick;
var blur = false;
window.addEventListener('blur', function() {
		missed = 0;
    blur = true;
});
window.addEventListener('focus', function() {
		missed = 0;
    blur = false;
    document.title =  _room;
});


var ChatBox = React.createClass({
	getInitialState: function() {
		return {
			messages: []
		};
	},
	componentWillMount: function() {
		var _this = this;
		if(!localStorage.getItem('nickName')){
			localStorage.setItem('nickName', JSON.stringify({}));
		}
		if(_room && !JSON.parse(localStorage.getItem('nickName'))[_room]){
			var nickName = prompt("Please enter nickname");
			if (nickName != null && nickName != "") {
					var nick = nickName.replace(/ /g,"-");
					var json = JSON.parse(localStorage.getItem('nickName'));
					json[_room] = nick;
			    localStorage['nickName'] = JSON.stringify(json);
			}
		}
		//show user joined status after checking server for username duplicates
		socket.emit('join', _room, JSON.parse(localStorage.getItem('nickName'))[_room]);

		//message room io.emit('message', room, nickname, message,  time);
		socket.on('message', function(room, user, message, time, isCode){
			if($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
		    _this.scroll = true;
		  } else {
		   	_this.scroll = false;
		  }
		  if(isCode){
		  	_this.code = true;
		  } else {
		  	_this.code = false;
		  }
			if(room == _room){
		  _this.setState({messages: _this.state.messages.concat({user : user, message: message, time: time})});
			}
		});

		//prompt user if username already is in room io.emit('user.prompt');
		socket.on('user.prompt', function(){
			if(localStorage.getItem('nickName') != null && localStorage.getItem('nickName') != ''){
				oldNick = JSON.parse(localStorage.getItem('nickName'))[_room];
			}
			var nickName = prompt("Nickname already exists please enter another one?");
			var json = JSON.parse(localStorage.getItem('nickName'));
			json[_room] = "";
			localStorage['nickName'] = JSON.stringify(json);
			if (nickName != null && nickName != '') {
			    var nick = nickName.replace(/ /g,"-");
					json = JSON.parse(localStorage.getItem('nickName'));
					json[_room] = nick;
			    localStorage['nickName'] = JSON.stringify(json);
			    socket.emit('join', _room, JSON.parse(localStorage.getItem('nickName'))[_room], oldNick);
			}
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('user.join', function(room, nickName, time, oldNick){
			//if new user to room
			if(room == _room && oldNick == null){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: nickName + " has joined", time: time})});
		  }
		  //if user changed name
		  if(room == _room && oldNick){
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

		socket.on('clear.chat', function(room){
			if(room == _room){
		  	_this.setState({messages: []});
		  }
		});
	},
	componentDidUpdate: function(prevProps, prevState) {
		if(this.scroll){
    	$('html, body').scrollTop( $(document).height() );
    }
    if(this.code){
    	highlight.highlightBlock($( "code:last" ).get(0));
    	this.code = false;
  	}
  	if(blur){
	  	missed++
	  	document.title = '[' + missed + '] - '+ _room;
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
		$('html, body').scrollTop( $(document).height() );
		var nickName = JSON.parse(localStorage.getItem('nickName'))[_room];
		if(!nickName){
			var nickName = prompt("Please enter nickname");
			if (nickName != null && nickName != '') {
	    	var nick = nickName.replace(/ /g,"-");
				var json = JSON.parse(localStorage.getItem('nickName'));
				json[_room] = nick;
		    localStorage['nickName'] = JSON.stringify(json);
		    socket.emit('join', _room, JSON.parse(localStorage.getItem('nickName'))[_room], oldNick);
			}
		}else{
			if(message.split(" ")[0] == '!'){
				this.code = true;
			}
		  socket.emit('message', _room, JSON.parse(localStorage.getItem('nickName'))[_room], message, this.code);
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