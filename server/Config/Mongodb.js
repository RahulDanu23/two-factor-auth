import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("Database connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Database disconnected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}`);

    } catch (error) {
        console.error("Failed to connect to database:", error.message);
        process.exit(1); // Exit if database connection fails
    }
};

export default connectDB;