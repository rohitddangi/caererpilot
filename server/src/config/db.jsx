import mongoose from 'mongoose';

export function isDbReady() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set. API is running in demo fallback mode.');
    return;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn(`MongoDB connection skipped: ${error.message}`);
  }
}
