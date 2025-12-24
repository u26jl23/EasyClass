const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")
const sessions = {}

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket)=> {
    console.log("User connected: ", socket.id)
    socket.on("create_session", ({type})=>{
        const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase()
        sessions[sessionId] = {
            type, // attendance or qa
            student: [],
            answers: [],
            active: true,
            question: type === 'qa'? '': null
        }
        socket.join(sessionId)
        socket.emit('session_created', sessionId)
        console.log(`Session ${sessionId} created (${type})`)
    })


    socket.on("disconnect", ()=>{
        console.log("User disconnected:", socket.id)
    })
})

server.listen(3001, () => {
    console.log("Server running on port 3001")
})