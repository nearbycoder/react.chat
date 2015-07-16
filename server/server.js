var io = require('socket.io')(6060);

io.on('connection', function(socket){
  socket.on('room', function(msg){
  	console.log(msg);
    io.emit(msg.room, msg);
  });
});