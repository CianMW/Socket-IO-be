import express from "express";
import cors from "cors"
import { createServer } from "http";
import { Server } from "socket.io";
import { IOnlineUser, IOnlineUsers } from "./interfaces";


process.env.TS_NODE_DEV && require("dotenv").config()  
// We are configuring our Express application 
console.log(process.env.MONGO_DB_URL)

const app = express();
let onlineUsers: IOnlineUser[] = []

app.use(cors())
app.get("/online-users", (req, res) => {
    res.send({ onlineUsers })
})

// We are creating an instance of a standard HTTP server based on our express config
const httpServer = createServer(app);

// We are creating a io server based on our HTTP server
const io = new Server(httpServer, { /* options */ });

// We are defining all of our event handlers
io.on("connection", (socket) => {
    console.log(socket.id)

    // We are setting the username for the user
    // This doubles as a "login" event since we dont have an auth system
    socket.on("setUsername", ({ username, room }) => {
        let singleUser : IOnlineUser = { username: username, socketId: socket.id, room: room }
        onlineUsers.push(singleUser)
        console.log("This is the Room: " ,room)
        console.log("This is the socketId: ", socket.id)
        
        socket.join(room)
        console.log(socket.rooms)
        socket.emit("loggedin", { currentUserSocketId: socket.id})
        socket.to(room).emit("newConnection")

    })

    // When we get a message from the frontend we broadcast it to all users in the room
    socket.on("sendmessage", ({ message, room }) => {
        //socket.broadcast.emit("message", message) // this is sending to all users except the sender
        console.log("THE ROOM:",room)
        socket.to(room).emit("message", message) // this is sending to all users in the room except the sender
    })

    socket.on("roomChange", ({socketId, room}) => {
        const index = onlineUsers.findIndex(user => user.socketId === socketId)
        const indexBackupCheck = onlineUsers.length
        console.log("INDEX IS:", index, indexBackupCheck)
        console.log("This is the Room: " ,room)
        socket.join(room)

        onlineUsers[index] = {...onlineUsers[index], room: room}
        socket.to(room).emit("updateUserList", {})
        console.log("666")
    })

    // When we disconnect we remove the user from the online users list
    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`)
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
    })
});

// We are starting our HTTP server and NOT our Express app
// Starting app.listen here would initialize and start another instance of a HTTP Server,
// which would be not including our io configuration
httpServer.listen(3030, () => {
    console.log("Listening on port 3030");
});