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
	socket.on('join', function(room, user){
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
			socket.broadcast.emit('user.join', room, user, time);
      
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
    var secondArg = parseArgs(message)[1];
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
        allClients.forEach(function(client){
          if(room == client.room){
            users.push(client.userName)
          }
        })
        if(typeof usr != "undefined"){
          if(_.includes(usr, "@")){
            usr = usr.replace("@", "");

            var index = user.indexOf(usr);
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

      case "/color":
        if(secondArg){
          colors = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgrey","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgrey","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
          if(secondArg == "help"){
            io.sockets.connected[allClients[i].id].emit('message', room, '*', 'color can be ' + colors.join(", "), time);
          }
          if(_.contains(colors, secondArg)){
            allClients[i].color = secondArg;
          }
          
        }
      break;
      default:
        io.emit('message', room, allClients[i].userName, message, time, isCode, allClients[i].color);
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