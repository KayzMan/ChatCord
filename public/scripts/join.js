let form = document.querySelector(".form");

form.addEventListener("submit", e => {
    let username = e.target.elements.username.value;
    let room = e.target.elements.room.value;
    fetch("/setUser", {method: "POST", body: JSON.stringify({username: username, room: room}), headers: {"Content-Type": "application/json"}})
});

