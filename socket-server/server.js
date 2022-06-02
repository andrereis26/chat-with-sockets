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
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});

io.attachApp(app);

// data
var messages = []
var usersTyping = []

io.on("connection", (socket) => {
    console.log("a user connected");

    // handle (with acknowledgement) to when there's a new user
    socket.on('new user', (userName, callback) => {
        // gen id and sends
        let newId = uuid.v4();

        // sends the user's id and messages to load
        callback({
            newId: newId,
            messages: messages
        });

    });

    // handle (with acknowledgement) to request to load messages
    socket.on('load messages', (userId, callback) => {
        // TO-DO
        // sends the user's messages
        callback({
            messages: messages
        });

    });

    // handle the chat message and send it to the other users
    socket.on('chat message', (user, msg) => {
        io.emit('chat message', { user: user, message: msg });
    });

    // handle when user starts typing and sends it to the other users
    socket.on('user is typing', (userId, userName) => {


        for (let i = 0; i < usersTyping.length; i++) {

            // check if already exists
            if (usersTyping[i].id == userId) {
                return;
            }
        }

        // add to array that the user is typing and sends it to the clients
        usersTyping.push({ id: userId, username: userName });
        io.emit('users typing', usersTyping);
    });

    // handle when user stop typing and sends it to the other users
    socket.on('user stopped typing', (userId) => {

        // removes user from usersTyping array and updates all clients of it
        removeUserFromTypingList(userId)
    });

    // handle when user says that will disconnect
    socket.on('user disconnect', (userId) => {

        console.log("bye");
        // removes user from usersTyping array and updates all clients of it
        removeUserFromTypingList(userId)
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


// functions
function removeUserFromTypingList(userId) {
    // removes user from array
    for (let i = 0; i < usersTyping.length; i++) {

        // remove if equals
        if (usersTyping[i].id == userId) {
            usersTyping.splice(i, 1)
        }
    }

    // semd the updated array
    io.emit('users typing', usersTyping);
}