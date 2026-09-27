import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
};

export default connectDB;
