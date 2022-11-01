let sidebar_open_btn = document.querySelector("#sidebar-open-btn");
let sidebar_close_btn = document.querySelector("#sidebar-close-btn");
let sidebar = document.querySelector(".chat-sidebar");
let notificationIcon = document.getElementById("bell");
let notificationText = document.querySelector("#notification .text")
const chatForm = document.querySelector("#chat-form");
const chatMessages = document.querySelector(".chat-messages .chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
var has_notification = false;

// Get username and room from url
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

sidebar_open_btn.onclick = () => show_hide_sidebar("show");
sidebar_close_btn.onclick = () => show_hide_sidebar("hide");
notificationIcon.onclick = () => show_hide_notification();

// Join chatroom
socket.emit("joinRoom", {username, room});

// Get room and users
socket.on("roomusers", data => {
    outputRoomName(data?.room);
    outputUsers(data?.users);
})

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Notification from server
socket.on('notification', text => {
    console.log(text);
    outputNotification(text);

    has_notification = true;

    // change notification icon to signify a new notification
    notificationIcon.classList.remove("fa-bell-slash");
    notificationIcon.classList.add("fa-bell");
})

// Message submit
chatForm.addEventListener("submit", e => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;

    if(msg && msg.length > 0){

        // emit message to server
        socket.emit("chatMessage", msg);

        // Clear input
        e.target.elements.msg.value = "";
        e.target.elements.msg.focus();
    }

});

// Output message to DOM
function outputMessage(message){
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    `
    document.querySelector(".chat-messages .chat-messages").appendChild(div);
}

// Add notification to DOM
function outputNotification(text){
    const li = document.createElement("li");
    li.innerHTML = `${text.text} ${text.time}`;
    document.querySelector("#notification .text ul").append(li);
}

// Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li class="user">${user.username} <i class="fas fa-heart-circle-plus"></i> </li>`).join('')}
    `;
    const ALl_Users = document.querySelectorAll(".user");
    ALl_Users.forEach(USER => USER.addEventListener("click", e => {
        socket.emit('liked', {you: username, other: e.target?.innerText})
    }));
}

function show_hide_sidebar(action){
    if(action?.toLowerCase() === "show"){
        sidebar.style.left = "0%";
    }else if(action?.toLowerCase() === "hide"){
        sidebar.style.left = "-100%";
    }
}

function show_hide_notification(){
    notificationText.classList.toggle("hide");

    if(notificationText.classList.contains("hide")){
        has_notification = !has_notification;
    }

    if(has_notification === false){
        // change notification icon to signify if notification or not
        notificationIcon.classList.remove("fa-bell");
        notificationIcon.classList.add("fa-bell-slash");
        notificationText.querySelector("ul").innerHTML = "";
    }
}