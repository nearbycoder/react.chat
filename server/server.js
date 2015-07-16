var io = require('socket.io')(6060);
var _ = require('underscore');
var allClients = [];
var userList = [];
io.on('connection', function(socket){

	//push new socket info to allClients
	allClients.push(socket);

	//get index of current socket in allClients
	var i = allClients.indexOf(socket);

	//join room if user does not exists else prompt user for new username
	socket.on('join', function(room, user, time){
  	var userExists = false;
  	var userLog = false;

  	//iterate over allClients to check userName for duplicates
  	allClients.forEach(function(client){
  		if(client.userName == user && client.room == room){
  			userExists = true;
  		}
  	})
  	if(userExists == false){
  		//send current user to room once no conflicts with users
			socket.broadcast.emit('user.join', room, user, time);
			allClients[i].userName = user;
			allClients[i].room = room;

			if(typeof userList[room] == 'undefined'){
				userList[room] = [];
			}
			if(!_.contains(userList[room], user)){
				userList[room].push(user);
			}
			
			//send list of users in current room to current client
  		io.sockets.connected[allClients[i].id].emit('getUserList', userList[room].join(", "));

		} else if (userExists == true) {
			//send prompt to current user/socket connected
			io.sockets.connected[allClients[i].id].emit('user.prompt');
		}
  });

	//message current room the user is in
  socket.on('message', function(room, user, message, time){
    io.emit('message', room, user, message, time);
  });

  //send disconnect notice to chat room for current socket username
  socket.on('disconnect', function() {
      var i = allClients.indexOf(socket);
      var user = allClients[i].userName;
      var room = allClients[i].room;
      delete allClients[i];
      //send disconnect message to chat room
      io.emit('disconnect', room, user);
   });

});
