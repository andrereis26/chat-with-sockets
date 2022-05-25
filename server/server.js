const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");
const { createServer } = require("http");
const axios = require('axios');

const httpServer = createServer();
const app = new App();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

io.attachApp(app);

io.on("connection", (socket) => {
    console.log("initial transport", socket.conn.transport.name); // prints "polling"

    // get data from our API to get the available files on FH
    axios.get('http://localhost:8000/GetFiles')
        .then(response => {
            // after getting the api response, emits to client the data that it got
            socket.emit("filesData", response.data);
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });



    socket.conn.once("upgrade", () => {
        // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
        console.log("upgraded transport", socket.conn.transport.name); // prints "websocket"
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
    });
});

app.listen(7000, (token) => {
    if (!token) {
        console.warn("port already in use");
    }

    console.log("Server is on");
});