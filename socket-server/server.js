const { Server } = require("socket.io");
const { createServer } = require("http");
const axios = require('axios');
const uuid = require("uuid");


const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});


// data
var messages = []
var usersTyping = []
var usersOnline = {}

io.on("connection", (socket) => {
    console.log("a user connected");

    // handle (with acknowledgement) to when there's a new user
    socket.on('user joinned', (userName, userId, callback) => {
        let newId = userId;

        //check if its a new user
        if (newId == '') {
            // gen id
            newId = uuid.v4();
        }

        // store socket
        usersOnline[socket.id] = { id: newId, username: userName }

        // updates the data from the other clients
        io.emit('load data', usersOnlineObjToList(usersOnline));

        // sends the user's id, messages, users typing and users online
        callback({
            newId: newId,
            username: userName,
            messages: messages,
            usersTyping: usersTyping,
            usersOnline: usersOnlineObjToList(usersOnline)  // transforms usersOnline obj into list
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

    // handle when user updates username
    socket.on('user updated username', (userId, newUsername) => {
        // updates on usersOnline array
        for (var key in usersOnline) {
            // skip loop if the property is from prototype
            if (!usersOnline.hasOwnProperty(key)) continue;

            // check if its user
            if (usersOnline[key].id == userId) {
                usersOnline[key].username = newUsername;
                break;
            }
        }

        // updates on usersTyping array
        for (let i = 0; i < usersTyping.length; i++) {

            if (usersTyping[i].id == userId) {
                usersTyping[i].userName = newUsername
                break
            }
        }

        // updates on messages array TO-DO

        // updates all clients data
        io.emit('load data', usersOnlineObjToList(usersOnline), usersTyping, messages);
    });

    // handle when user says that will disconnect
    socket.on('user disconnect', (userId) => {

        // this if prevents the server crash because of previous connected users
        if (usersOnline[socket.id] != undefined) {
            // removes user from usersTyping array and updates all clients of it
            removeUserFromTypingList(userId)
        }

        // remove user from list of online users
        delete usersOnline[socket.id]

        // updates the data from the other clients
        io.emit('load data', usersOnlineObjToList(usersOnline));

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

        // this if prevents the server crash because of previous connected users
        if (usersOnline[socket.id] != undefined) {
            // removes user from usersTyping array and updates all clients of it
            removeUserFromTypingList(usersOnline[socket.id].id)
        }

        // remove user from list of online users
        delete usersOnline[socket.id]

        // send the updated array
        io.emit('users typing', usersTyping);

        // updates clients of users online
        io.emit('users online', usersOnlineObjToList(usersOnline));

        console.log('user disconnected');
    });
});

httpServer.listen(7000, (token) => {
    if (!token) {
        console.warn("port already in use");
    }

    console.warn("Server is on");

});


// functions
function removeUserFromTypingList(userId) {
    // removes user from array
    for (let i = 0; i < usersTyping.length; i++) {

        // remove if equals
        if (usersTyping[i].id == userId) {
            usersTyping.splice(i, 1)
            break
        }
    }

    // semd the updated array
    io.emit('users typing', usersTyping);
}

function usersOnlineObjToList(usersObj) {
    let list = []
    for (var key in usersObj) {
        // skip loop if the property is from prototype
        if (!usersObj.hasOwnProperty(key)) continue;

        list.push(usersObj[key])
    }

    return list
}