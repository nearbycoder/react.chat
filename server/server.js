var io = require('socket.io')(6060);


io.on('connection', function(socket){
  console.log('a user connected');
});