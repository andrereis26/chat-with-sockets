const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");
const { createServer } = require("http");
const axios = require('axios');
const uuid = require("uuid");

const httpServer = createServer();
const app = new App();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

io.attachApp(app);

// data
var messages = []
var usersTyping = []

io.on("connection", (socket) => {
    console.log("a user connected");

    // handle to when user is ready to receive data
    socket.on('ready to receive', (userName) => {
        console.log("i amready");
        // gen id and sends
        let newId = uuid.v4();
        io.emit('user id', newId);

        // sends the messages to load
        io.emit('load messages', messages);
    });


    // handle the chat message and send it to the other users
    socket.on('chat message', (msg) => {
        io.emit('chat message', JSON.parse(msg));
    });

    // handle when user starts typing and sends it to the other users
    socket.on('user is typing', (usedId) => {
        // add to array os user typing
        usersTyping.push(usedId);
        io.emit('users typing', usersTyping);
    });

    // handle when user stop typing and sends it to the other users
    socket.on('user stopped typing', (userId) => {

        // removes user from array
        var index = usersTyping.indexOf(userId);
        if (index !== -1) {
            usersTyping.splice(index, 1);
        }

        // semd the updated array
        io.emit('users typing', usersTyping);
    });

    socket.conn.once("upgrade", () => {
        // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    });

    socket.conn.on("packet", ({ type, data }) => {
        // called for each packet received
    });

    socket.conn.on("packetCreate", ({ type, data }) => {
        // called for each packet sent
    });

    socket.conn.on("drain", () => {
        // called when the write buffer is drainedss
    });

    socket.conn.on("close", (reason) => {
        // called when the underlying connection is closed

        // removes user from array [FIND A WAY TO KNOW WHO WAS THE USER THAT DC]

        // send the updated array
        io.emit('users typing', usersTyping);

        console.log('user disconnected');
    });
});

app.listen(7000, (token) => {
    if (!token) {
        console.warn("port already in use");
    }

    console.warn("Server is on");
    console.log("   > Local:        http://localhost:7000/");
    console.log("   > Network:      http://192.168.1.64:7000/");
    console.log("   > Network (vm): http://192.168.56.1:7000/");
});