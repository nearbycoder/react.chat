var io = require('socket.io')(6060);
var _ = require('underscore');
var moment = require("moment");
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
  		if(client.userName == user && client.room == room){
  			userExists = true;
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
      if(oldNick){
        var index = userList[room].indexOf(oldNick);
        userList[room].splice(index, 1);
      }
			if(!_.contains(userList[room], user)){
				userList[room].push(user);
			}
			
			//send list of users in current room to current client
  		io.sockets.connected[allClients[i].id].emit('getUserList', userList[room].join(", "), time);

		} else if (userExists == true) {
			//send prompt to current user/socket connected
			io.sockets.connected[allClients[i].id].emit('user.prompt');
		}
  });

	//message current room the user is in
  socket.on('message', function(room, user, message){
    var time = moment().format('MMMM Do YYYY, h:mm:ss a');
    io.emit('message', room, user, message, time);


    var cmd = parseArgs(message);
    
    switch(cmd){
      case "/nick":
        io.sockets.connected[allClients[i].id].emit('user.prompt');
      break;

      case "/help":
        io.emit('message', room, '*', "[/nick : reset your nickname]", time);
      break;
    }






  });

  //send disconnect notice to chat room for current socket username
  socket.on('disconnect', function() {
    var time = moment().format('MMMM Do YYYY, h:mm:ss a');
    var i = allClients.indexOf(socket);
    var user = allClients[i].userName;
    var room = allClients[i].room;
    
    //check if room exists and has current disconnect name. If so remove from array
    if(typeof userList[room] != "undefined"){
      var index = userList[room].indexOf(user);
      userList[room].splice(index, 1);
    }
    
    delete allClients[i];

      
    //send disconnect message to chat room
    io.emit('disconnect', room, user, time);

  });

});

function parseArgs(message){
  var args = message.split(" ");
  return args[0];
}