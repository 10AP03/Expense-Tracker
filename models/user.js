// 1.Importing Mongoose 
import mongoose from "mongoose";

// 2. Creating a Schema
const userSchema = new mongoose.Schema({

  // 3. Defining the Fields
  name:{
    type: String,
    required: true
  },

  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password:{
    type: String,
    required: true,
    select: false
  }
},{
  // 4.Enable the timestamp
  timestamps: true
});

// 5.Converting schema into Model
const User = mongoose.model("User", userSchema);

// 6. Exporting the User
export default User;

