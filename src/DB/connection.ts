import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(`Error: ${(error as Error).message}`);
  }
};

export default connectDB;
