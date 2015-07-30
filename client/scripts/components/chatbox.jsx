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
var blur = false;
var gif = false;
var userNotice = false;
var code = false;


//parse url from messages
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
    })
}
//enable tab message show
window.addEventListener('blur', function() {
		missed = 0;
    blur = true;
});
//remove tab message show and show room title
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
		//set this to be used inside other functions
		var _this = this;

		//set nickName localstorage to empty object
		if(!localStorage.getItem('nickName')){
			localStorage.setItem('nickName', JSON.stringify({}));
		}
		//prompt for nickname if not set within this room
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

		socket.on('gif', function(room, user, img, time){
			if(room == _room){
				_this.gif = true;
				_this.setState({messages: _this.state.messages.concat({user : user, message: img, time: time})});
			}
		});

		//message room io.emit('message', room, nickname, message,  time);
		socket.on('message', function(room, user, message, time, isCode, color){
			//scroll to bottom if within 200px of the bottom and a message arrives
			if($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
		    _this.scroll = true;
		  } else {
		   	_this.scroll = false;
		  }
		  //if first character of message is ! then parse message as code
		  if(isCode){
		  	_this.code = true;
		  } else {
		  	_this.code = false;
		  }
		  //if user message color provided set color else false;
		  if(color){
		  	_this.color = color;
		  } else {
		  	_this.color = false;
		  }
		  //if room and user is not null send message
			if(room == _room && user != null){
		  _this.setState({messages: _this.state.messages.concat({user : user, message: message, time: time})});
			}
		});

		//prompt user if username already is in room io.emit('user.prompt');
		socket.on('user.prompt', function(){
			var nickName = prompt("Nickname already exists please enter another one?");
			var json = JSON.parse(localStorage.getItem('nickName'));
			json[_room] = "";
			localStorage['nickName'] = JSON.stringify(json);
			if (nickName != null && nickName != '') {
			    var nick = nickName.replace(/ /g,"-");
					json = JSON.parse(localStorage.getItem('nickName'));
					json[_room] = nick;
			    localStorage['nickName'] = JSON.stringify(json);
			    socket.emit('join', _room, JSON.parse(localStorage.getItem('nickName'))[_room]);
			}
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('user.join', function(room, nickName, time){
			//if new user to room
			if(room == _room && !_this.userNotice){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: nickName + " has joined", time: time})});
		  }
		});

		//join room io.emit('user.join', room, nickname, time);
		socket.on('getUserList', function(userList, time){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: "current users in room " + userList, time: time})});
		});

		//disconnect user and send disconnect notice to state socket.on('disconnect', function(room,user));
		socket.on('disconnect', function(room, user, time){
			if(room == _room && !_this.userNotice){
		  	_this.setState({messages: _this.state.messages.concat({user : '*', message: user + " has left", time: time})});
		  }
		});
		//clear chat for room
		socket.on('clear.chat', function(room){
			if(room == _room){
		  	_this.setState({messages: []});
		  }
		});
	},
	componentDidUpdate: function(prevProps, prevState) {
		//parse last message for links
		var $elem = $( "code:last").html();
		if($elem){
			if($elem.indexOf("color can be set to") > -1){
				var colorMessage = [];
				var colors = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgrey","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgrey","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
				colors.forEach(function(color){
					colorMessage.push("<span style='color:"+ color +"'>"+ color +"</span>")
				})
				$elem = $elem + colorMessage.join(", ");
			}
			if(!this.gif){
  		$elem = urlify($elem);
  		$( "code:last").html($elem);
	  	}
			if(this.gif){
	  		$( "code:last").html("<img src="+$elem+"></img>");
	  		this.gif = false;
	  		$('html, body').scrollTop( $(document).height() );
	  	}
			if(this.color && !this.code){
				$( "code:last").html('<span style="color:' + this.color +'">'+ $elem +'</span>');
				this.color = false;
			}
			if(this.scroll){
	    	$('html, body').scrollTop( $(document).height() );
	    }
	    //parse last message if set to code
	    if(this.code){
	    	highlight.highlightBlock($( "code:last" ).get(0));
	    	this.code = false;
	  	}
		}
		
  	//if winow not focused count message in title
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
		//scroll to bottom of page
		$('html, body').scrollTop( $(document).height() );

		//check for nickname
		var nickName = JSON.parse(localStorage.getItem('nickName'))[_room];
		//no nickname ask for nickname
		if(!nickName){
			var nickName = prompt("Please enter nickname");
			if (nickName != null && nickName != '') {
	    	var nick = nickName.replace(/ /g,"-");
				var json = JSON.parse(localStorage.getItem('nickName'));
				json[_room] = nick;
		    localStorage['nickName'] = JSON.stringify(json);
		    socket.emit('join', _room, JSON.parse(localStorage.getItem('nickName'))[_room]);
			}
		}else{
			if(message.split(" ")[0] == '!'){
				this.code = true;
			}
			if(message.split(" ")[0] == '/hideusernotice'){
				this.userNotice = !this.userNotice;
				this.setState({messages: this.state.messages.concat({user : '*', message: "user notice is " + !this.userNotice})});
			}else{
				//send message to room
		  	socket.emit('message', _room, JSON.parse(localStorage.getItem('nickName'))[_room], message, this.code);
			}
			
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