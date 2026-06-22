import connectDB from "./config/db.js"; 
import dotenv from "dotenv";        
import express from "express"; 
import cors from "cors"
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import userRoutes from "./routes/userRoutes.js";     

dotenv.config(); 
connectDB();                        

const app = express();

// Add CORS before everything
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://expense-tracker-frontend-thf0.onrender.com"
  ],
  credentials: true
}))
app.use(express.json());

app.get("/",(req,res)=>{
  res.send("Expense Tracker API is Running...");
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});