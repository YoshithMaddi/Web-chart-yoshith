import mongoose from "mongoose";

let connectionPromise;

mongoose.connection.on("connected", () => console.log("Database Connected"));
mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));

// Reuse the same connection promise so serverless invocations don't race queries
// before Mongoose is ready.
export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || "chat-app";

    if (!uri) {
        throw new Error("MONGODB_URI is not defined");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(uri, {
            dbName,
            serverSelectionTimeoutMS: 10000,
        }).catch((error) => {
            connectionPromise = undefined;
            throw error;
        });
    }

    await connectionPromise;
    return mongoose.connection;
};
