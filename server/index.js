const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store data in memory
// { sessionId: { type: 'attendance' | 'qa', students: [], answers: [], active: true, question: '' } }
const sessions = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Teacher creates a session
  socket.on("create_session", ({ type }) => {
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    sessions[sessionId] = {
      type,
      students: [],
      answers: [],
      active: true,
      question: type === "qa" ? "" : null,
    };
    socket.join(sessionId);
    socket.emit("session_created", sessionId);
    console.log(`Session ${sessionId} created (${type})`);
  });

  // Student joins a session
  socket.on("join_session", (sessionId) => {
    if (sessions[sessionId] && sessions[sessionId].active) {
      socket.join(sessionId);
      socket.emit("session_joined", {
        sessionId,
        type: sessions[sessionId].type,
        question: sessions[sessionId].question,
      });
    } else {
      socket.emit("error", "Session not found or closed");
    }
  });

  // Student signs in (Attendance)
  socket.on("sign_in", ({ sessionId, studentId, name }) => {
    if (sessions[sessionId] && sessions[sessionId].active) {
      // Check if already signed in
      const exists = sessions[sessionId].students.find(
        (s) => s.studentId === studentId
      );
      if (!exists) {
        const student = {
          studentId,
          name,
          socketId: socket.id,
          time: new Date(),
        };
        sessions[sessionId].students.push(student);
        // Notify teacher (and everyone in room)
        io.to(sessionId).emit(
          "update_attendance",
          sessions[sessionId].students
        );
      }
    }
  });

  // Teacher sets question (QA)
  socket.on("set_question", ({ sessionId, question }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].question = question;
      io.to(sessionId).emit("new_question", question);
    }
  });

  // Student answers (QA)
  socket.on("submit_answer", ({ sessionId, studentId, name, answer }) => {
    if (sessions[sessionId] && sessions[sessionId].active) {
      const entry = { studentId, name, answer, socketId: socket.id };
      sessions[sessionId].answers.push(entry);
      io.to(sessionId).emit("update_answers", sessions[sessionId].answers);
    }
  });

  // Teacher closes session
  socket.on("close_session", (sessionId) => {
    if (sessions[sessionId]) {
      sessions[sessionId].active = false;
      io.to(sessionId).emit("session_closed");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});