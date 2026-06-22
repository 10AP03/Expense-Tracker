// 1.Importing the User
import User from "../models/user.js";

// 2.Exporting the Controller Function
export const registerUser = async(req,res) => {
  // 3. Try and Catch Block
  try {
    // 4.Extracting the data from the request 
    const {name,email,password} = req.body;

    // 5. Checking the condition for already Existing User
    const existingUser = await User.findOne({email});

    if(existingUser){
      return res.status(400).json({message:"User already Exist."});
    }
    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      message:"User registered Successfully.",user
    });
  }catch(error){
    res.status(500).json({message:error.message});
  }
};

export const getUserProfile = async (req, res) => {
  try {
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
    
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};