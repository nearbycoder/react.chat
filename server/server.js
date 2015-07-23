var io = require('socket.io')(6060);
var _ = require('underscore');
var moment = require("moment");
var config = require("./config");
var allClients = [];
io.on('connection', function(socket){

	//push new socket info to allClients
	allClients.push(socket);

	//get index of current socket in allClients
	var i = allClients.indexOf(socket);

	//join room if user does not exists else prompt user for new username
	socket.on('join', function(room, user, oldNick){
    var time = moment().format('MMMM Do YYYY, h:mm:ss a');
  	var userExists = false;
    var users = [];

  	//iterate over allClients to check userName for duplicates
  	allClients.forEach(function(client){
  		if(client.userName == user && client.room == room || user == 'undefined'){
  			userExists = true;
  		}
  	})
  	if(userExists == false && user != null){
  		//send current user to room once no conflicts with users
			socket.broadcast.emit('user.join', room, user, time, oldNick);
      
			allClients[i].userName = user;
			allClients[i].room = room;

      allClients.forEach(function(client){
        if(room == client.room){
          users.push(client.userName)
        }
      })
			
			//send list of users in current room to current client
  		io.sockets.connected[allClients[i].id].emit('getUserList', users.join(","), time);

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
    var users = [];
    
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
        allClients.forEach(function(client){
          if(client.room == room){
            users.push(client.userName)
          }
        })

        io.sockets.connected[allClients[i].id].emit('message', room, '*', 'Current users in room are ' + users.join(","), time);
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
    io.emit('disconnect', room, user, time);
    delete allClients[s];
  });

});

function parseArgs(message){
  var args = message.split(" ");
  return args;
}