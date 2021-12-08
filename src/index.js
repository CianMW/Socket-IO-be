import express from "express";
import cors from "cors"
import { createServer } from "http";
import { Server } from "socket.io";

// We are configuring our Express application 
const app = express();

let onlineUsers = []

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
        onlineUsers.push({ username: username, socketId: socket.id, room: room })

        socket.join(room)
        console.log(socket.rooms)

        socket.emit("loggedin")
        socket.to(room).emit("newConnection")
    })

    // When we get a message from the frontend we broadcast it to all users in the room
    socket.on("sendmessage", ({ message, room }) => {
        //socket.broadcast.emit("message", message) // this is sending to all users except the sender
        socket.to(room).emit("message", message) // this is sending to all users in the room except the sender
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
httpServer.listen(3000, () => {
    console.log("Listening on port 3000");
});