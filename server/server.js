import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;
    
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

// Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors());

// Keep a lightweight health endpoint available even if the database is down.
app.use("/api/status", (req, res)=> res.send("Server is live"));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database unavailable:", error.message);
        res.status(503).json({
            success: false,
            message: "Database connection failed. Please try again in a moment.",
        });
    }
});


// Routes setup
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)


if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    connectDB()
        .then(() => {
            server.listen(PORT, ()=> console.log("Server is running on PORT: " + PORT));
        })
        .catch((error) => {
            console.error("Failed to start server:", error.message);
            process.exit(1);
        });
}

// Export server for Vervel
export default server;
