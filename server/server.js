var io = require('socket.io')(6060);
var _ = require('underscore');
var moment = require("moment");
var config = require("./config");
var allClients = [];
var userList = [];
io.on('connection', function(socket){

	//push new socket info to allClients
	allClients.push(socket);

	//get index of current socket in allClients
	var i = allClients.indexOf(socket);

	//join room if user does not exists else prompt user for new username
	socket.on('join', function(room, user, oldNick){
    var time = moment().format('MMMM Do YYYY, h:mm:ss a');
  	var userExists = false;
  	var userLog = false;

  	//iterate over allClients to check userName for duplicates
  	allClients.forEach(function(client){
  		if(client.userName == user || user == 'undefined'){
  			userExists = true;
        for(list in userList){
          var index = userList[list].indexOf(oldNick);
          console.log(index)
          if(index != -1){
            userList[list].splice(index, 1);
            userList[list].push(user);
          }
        }
  		}
  	})
  	if(userExists == false && user != null){
  		//send current user to room once no conflicts with users
			socket.broadcast.emit('user.join', room, user, time, oldNick);
			allClients[i].userName = user;
			allClients[i].room = room;

			if(typeof userList[room] == 'undefined'){
				userList[room] = [];
			}
        for(list in userList){
          var index = userList[list].indexOf(oldNick);
          console.log(index)
          if(index != -1){
            userList[list].splice(index, 1);
            userList[list].push(user);
          }
        }
			if(!_.contains(userList[room], user)){
				userList[room].push(user);
			}
			
			//send list of users in current room to current client
  		io.sockets.connected[allClients[i].id].emit('getUserList', userList[room].join(","), time);

		} else if (userExists == true) {
			//send prompt to current user/socket connected
			io.sockets.connected[allClients[i].id].emit('user.prompt');
		}
  });

	//message current room the user is in
  socket.on('message', function(room, user, message, isCode){
    var time = moment().format('MMMM Do YYYY, h:mm:ss a');
    var cmd = parseArgs(message)[0];
    var usr = parseArgs(message)[1];
    
    switch(cmd){
      //prompt user to reset their nickname
      case "/nick":  
        io.sockets.connected[allClients[i].id].emit('user.prompt');
      break;
      //list all commands in room
      case "/help":
        io.sockets.connected[allClients[i].id].emit('message', room, '*', config.commands, time);
      break;
      //list all users in current room
      case "/list":
        io.sockets.connected[allClients[i].id].emit('message', room, '*', 'Current users in room are ' + userList[room], time);
      break;
      //ability to private message user with /pm <@username> <message>
      case "/pm":
        if(typeof usr != "undefined"){
          if(_.includes(usr, "@")){
            usr = usr.replace("@", "");
            var index = userList[room].indexOf(usr);
            var foundUser = false;
            allClients.forEach(function(client){
              if(usr == client.userName){
                foundUser = true;
                io.sockets.connected[client.client.id].emit('message', room, user, message, time);
              }
            });
            if(!foundUser){
              io.sockets.connected[allClients[i].id].emit('message', room, '*', 'user does not exists', time);
            };
          };
        };
      break;
      case "/clear":
        io.sockets.connected[allClients[i].id].emit('clear.chat', room);
      break;
      default:
        io.emit('message', room, user, message, time, isCode);
    }
  });

  //send disconnect notice to chat room for current socket username
  socket.on('disconnect', function() {
    var time = moment().format('MMMM Do YYYY, h:mm:ss a');
    var s = allClients.indexOf(socket);
    var user = allClients[s].userName;
    var room = allClients[s].room;
    
    //check if room exists and has current disconnect name. If so remove from array
    if(typeof userList[room] != "undefined"){
      var index = userList[room].indexOf(user);
      userList[room].splice(index, 1);
    }
    
    delete allClients[s];

      
    //send disconnect message to chat room
    io.emit('disconnect', room, user, time);

  });

});

function parseArgs(message){
  var args = message.split(" ");
  return args;
}