const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io")
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers }  = require("./utils/users");

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
    const user = userJoin(socket.id, data?.username, data?.room);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message",  formatMessage(botName, `${user.username} has joined the chat`))

        // Send users and room info
        io.to(user.room).emit("roomusers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message",  formatMessage(user.username, msg));
    });

    // Brodcast when user disconnects
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

let username;
let room;

app.post("/setUser", (req, res) => {
    // console.log(req.body);
    username = req.body?.username;
    room = req.body?.room;
    res.status(200).end();
})

app.get("/user", (req, res) => {
    res.json({
        username: username,
        room: room
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server listening on port http://localhost:${PORT}`));
