import mongoose from "mongoose";  // Node.js-> Mongoose->MongoDB 

const connectDB = async () => {   // Connection Function making, why async? because server sends request and database responds so it takes time
  try 
  {
    const conn = await mongoose.connect(process.env.MONGO_URI); //connected to database

    console.log(`Mongo DB is connected : ${conn.connection.host}`);
  }
  catch (error)
  {
    console.error("Database connection error:",error.message);
    process.exit(1);
  }
};

export default connectDB;