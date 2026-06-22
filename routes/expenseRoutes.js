import express from "express";
import{addExpense,getExpense,updateExpense,deletedExpense,expenseSummary} from "../controllers/expenseController.js";
import {protect} from "../middleware/authmiddleware.js";

const router = express.Router();

// 1. Summary Expense
router.get("/summary",protect,expenseSummary);

// 2.Add Expense
router.post("/",protect,addExpense);

// 3.Get Expense
router.get("/",protect,getExpense);

// 4.Update Expense
router.put("/:id",protect,updateExpense);

// 5.Delete Expense
router.delete("/:id",protect,deletedExpense);


export default router;
