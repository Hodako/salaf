import mongoose from "mongoose";
import "@/models"; // Force register all Mongoose models to prevent MissingSchemaError on cold starts/lazy routes

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env"
    );
}

let cached = (globalThis as any).mongoose;

if (!cached) {
    cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * 
 * Uses a global variable to cache the connection across hot-reloads 
 * in development to prevent connection pool exhaustion.
 * 
 * @returns A promise that resolves to the Mongoose connection instance.
 * @throws Error if the MONGODB_URI environment variable is not defined.
 */
async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.time("[DB Telemetry] First Connect Handshake");
        cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
            console.timeEnd("[DB Telemetry] First Connect Handshake");
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export { dbConnect };
