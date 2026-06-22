import Expense from "../models/expense.js";
import mongoose from "mongoose";

// 1.Add Expense
export const addExpense = async(req,res)=>
{
    try 
    {
        const{title,amount,category,date} = req.body;
        const expense = await Expense.create({
          title,
          amount,
          category,
          date,
          user: req.user.id
        });
        res.status(201).json({
          message:"Expense Added Successfully.",
          expense
        });
    }
    catch(error)
    {
        res.status(500).json({
          message:error.message
        });
    }
};

// 2.Get All Expenses
export const getExpense = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const expenses = await Expense.find({ user: req.user._id })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3.Update the Expense
export const updateExpense = async(req,res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if(!expense) {
      return res.status(404).json({
        message: "Expense Not Found"
      }); 
    }

    if(expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this expense"
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedExpense);
  }
  catch(error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// 4.Delete the Expense
export const deletedExpense = async(req,res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if(!expense) {
      return res.status(404).json({
        message: "Expense Not Found."
      });
    }

    if(expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this expense"
      });
    }

    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Expense Deleted Successfully.",
      deletedExpense
    });
  }
  catch(error) {
    res.status(500).json({
      message: error.message
    });
  }
};
export const expenseSummary = async (req, res) => {
  try {
    const type = req.query.type;
    let format;

    if (type === "day") format = "%Y-%m-%d";
    else if (type === "week") format = "%Y-%U";
    else if (type === "month") format = "%Y-%m";
    else if (type === "year") format = "%Y";
    else format = "%Y-%m";

    const summary = await Expense.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user._id) }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: format,
              date: "$date"
            }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};