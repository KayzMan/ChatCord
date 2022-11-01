const users = []

// Join user to chat
function userJoin(id, username, room){
    const user = {id:id, username:username, room:room, likes: 0};
    
    users.push(user);

    return user;
}

// Get current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

// Get user with username
function  getUserWithName(name){
    return users.find(user => user.username === name);
}

// User leaves chat
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getUserWithName
}