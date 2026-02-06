const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 4500;

// Users and messages storage
const users = {};
const messagesPerRoom = {}; // Store messages per room

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello, it's working");
});

const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

setInterval(() => {
    for (const room in messagesPerRoom) {
        messagesPerRoom[room] = [];
    }
    console.log("Cleared all messages from memory");
}, 1000 * 60 * 30); // 1 hour

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // User joins a room
    socket.on('join-room', ({ room, user }) => {
        socket.join(room);
        users[socket.id] = user;

        if (!messagesPerRoom[room]) messagesPerRoom[room] = [];

        // Send previous messages to new user
        socket.emit('previousMessages', messagesPerRoom[room]);

        // Broadcast welcome message
        io.to(room).emit('welcome', {
            user: "Admin",
            message: `${user} joined room ${room}`
        });
    });

    // Handle new message
    socket.on('message', ({ message, room, replyTo }) => {
        if (room) {
            const newMessage = {
                user: users[socket.id],
                message,
                id: socket.id,
                replyTo: replyTo || null // attach reply info if any
            };

            if (!messagesPerRoom[room]) messagesPerRoom[room] = [];
            messagesPerRoom[room].push(newMessage);

            // Keep only last 100 messages
            if (messagesPerRoom[room].length > 100) messagesPerRoom[room].shift();

            // Broadcast to room
            io.to(room).emit('sendMessage', newMessage);
        }
    });

    // Typing indicators
    socket.on('typing', (room) => {
        const user = users[socket.id];
        if (room && user) socket.to(room).emit('showTyping', `${user} is typing...`);
    });

    socket.on('stopTyping', (room) => {
        if (room) socket.to(room).emit('hideTyping');
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log(`User ${user} disconnected`);
            socket.broadcast.emit('leave', {
                user: 'Admin',
                message: `${user} has left`
            });
            delete users[socket.id];
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
