import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddEditExpense from './pages/AddEditExpense'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import { AuthProvider } from './context/AuthContext'
import AIChat from './components/AIChat'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddEditExpense />} />
          <Route path="/edit-expense/:id" element={<AddEditExpense />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <AIChat />
      </Router>
    </AuthProvider>
  )
}

export default App