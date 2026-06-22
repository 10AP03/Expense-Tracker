// 1.Importing Mongoose 
import mongoose from "mongoose";

// 2.Creating Schema
const expenseSchema = new mongoose.Schema({

  // 3.Defining and Linking the fields with the user
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // 4.Expense Title
  title:{
    type: String,
    required: true
  },
  // 5.Expense Amount
  amount:{
    type: Number,
    required: true
  },
  // 6.Expense Category
  category:{
    type: String,
    required: true
  },
  // 7.Expense Date
  date:{
    type: Date,
    default: Date.now
  }
},{
  // 8.Enable Timestamp
  timestamps: true
});

// 9.Converting the Schema into the Model
const Expense = mongoose.model("Expense",expenseSchema);

// 10.Exporting the Expense
export default Expense;

