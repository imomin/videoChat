/*  MIT License: https://webrtc-experiment.appspot.com/licence/ -- https://github.com/muaz-khan */

// var port = 80; // use port:80 for non-localhost tests
var port = 8888; // use port:8888 for localhost tests

var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');

app.configure(function(){  
  app.use(express.static(path.join(__dirname, 'public')));
});

server.listen(port);

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
