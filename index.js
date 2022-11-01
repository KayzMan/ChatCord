const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io")
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, getUserWithName }  = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended: true}))

const botName = 'ChatCord Bot'

// Run when a client connects
io.on("connection", socket => {

    socket.on("joinRoom", (data) => {
    let user = userJoin(socket.id, data?.username, data?.room);

        socket.join(user.room);
        socket.join(user.username);

        // Welcome current user
        socket.emit('message', formatMessage(botName, `Welcome to ChatCord!`));
        socket.emit('notification', formatMessage(botName, `You have ${user?.likes} likes.`));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message",  formatMessage(botName, `${user.username} has joined the chat`))

        // Send users and room info
        io.to(user.room).emit("roomusers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for a like
    socket.on('liked', data => {
        if(data?.you !== data?.other){
            let you = data?.you;
            let other = data?.other;
            let other_user = getUserWithName(other);
            other_user.likes++;
            socket.to(other_user.username).emit('notification', formatMessage(botName, `${you} liked you.`));
            socket.to(other_user.username).emit('notification', formatMessage(botName, `You now have ${other_user.likes} like(s).`));
        }
    })

    // Listen for chatMessage
    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message",  formatMessage(user.username, msg));
    });

    // Broadcast when user disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message",  formatMessage(botName, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit("roomusers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`));
