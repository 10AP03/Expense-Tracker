import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req,res)=>{

    try 
    {
      const{name,email,password} = req.body;       // Extract the field names 
      const emailLower = email.toLowerCase();

      // Check missing fields
      if(!name || !email || !password)
      {
        return res.status(400).json({
          message: "All fields are required"
        });
      }

      const existingUser = await User.findOne({email: emailLower});
      if(existingUser)
      {
        return res.status(400).json({message:"User already exist."});
      }
      // 3.HashPassword using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password,salt);

      // 4.Creating new User for MongoDB
      const user = await User.create({
        name,
        email: emailLower,
        password: hashedPassword
      });

      // 5. Generate JWT Token
      const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
      );

      // 6. Send response
      res.status(201).json({
      message: "User registered successfully",
      token,
      user:{
        id: user._id,
        name: user.name,
        email: user.email
      }
      });
    }
    catch(error)
    {
      res.status(500).json({
      message: error.message
    });
    }
};

export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Check missing fields
    if( !email || !password){
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    // check if user exists
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    if (!user.password) {
      return res.status(500).json({
      message: "User password not found"
      });
    }
    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user:{
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
