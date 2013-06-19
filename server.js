var express = require("express");
var app = express();
var server = require('http').createServer(app).listen(process.env.VCAP_APP_PORT || 8080);
var path = require('path');
var io = require('socket.io').listen(server, { log: false });

app.configure(function(){  
  app.use(express.static(path.join(__dirname, 'public')));
});


/* -------------- <socket.io> -------------- */
io.sockets.on('connection', function (socket) {
    if (!io.connected) io.connected = true;

    socket.on('new-channel', function (data) {
        onNewNamespace(data.channel, data.sender);
    });

    // Start listening for mouse move events
    socket.on('mousemove', function (data) {    
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        io.sockets.emit('moving', data);
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender) socket.broadcast.emit('message', data.data);
        });
    });
}

/* -------------- </socket.io> -------------- */
app.get('/', function (req, res) {
    //res.sendfile(__dirname + '/public/rtcpeer.html');
    res.sendfile(__dirname + '/public/index.html');
});
