// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Define global mongoose cache
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend globalThis with mongoose cache
declare global {
    var mongoose: MongooseCache | undefined;
}

// Initialize cache
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Set global mongoose cache
if (!global.mongoose) {
    global.mongoose = cached;
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ Connected to MongoDB');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', e);
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase;