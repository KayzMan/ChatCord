let sidebar_open_btn = document.querySelector("#sidebar-open-btn");
let sidebar_close_btn = document.querySelector("#sidebar-close-btn");
let sidebar = document.querySelector(".chat-sidebar");
const chatForm = document.querySelector("#chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const usernameLabel = document.querySelector(".username");

getUserDetails();

const socket = io();

sidebar_open_btn.onclick = () => show_hide_sidebar("show");
sidebar_close_btn.onclick = () => show_hide_sidebar("hide");

function show_hide_sidebar(action){
    if(action?.toLowerCase() === "show"){
        sidebar.style.left = "0%";
    }else if(action?.toLowerCase() === "hide"){
        sidebar.style.left = "-100%";
    }
}

// Join chatroom
// capture user's name and room
function getUserDetails(){
    fetch("/user")
    .then(response => response.json())
    .then(data => {
        console.log(data?.username);
        usernameLabel.textContent = data?.username;
        socket.emit("joinRoom", { username:data?.username, room:data?.room });
    });
}

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
    document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}
