import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#6d28d9']

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚',
  Utilities: '💡', Other: '💰'
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ open: false, expenseId: null, title: '' })
  const [deleting, setDeleting] = useState(false)
  const { user, token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        API.get('/expenses?limit=5'),
        API.get('/expenses/summary?type=month')
      ])
      setExpenses(expRes.data)
      setSummary(sumRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (expenseId, title) => {
    setDeleteModal({ open: true, expenseId, title })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, expenseId: null, title: '' })
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await API.delete(`/expenses/${deleteModal.expenseId}`)
      closeDeleteModal()
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const fetchAiInsight = async () => {
    setAiLoading(true)
    try {
      const prompt = `You are a personal finance AI assistant. Analyze these expenses and give 3 short, specific, actionable insights in a friendly tone. Keep each insight to 1 sentence. Format as bullet points.

Expenses: ${JSON.stringify(expenses)}
Monthly Summary: ${JSON.stringify(summary)}
User: ${user?.name}`

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024
          })
        }
      )
      const data = await response.json()
      if (data.error) {
        setAiInsight('Unable to load AI insights right now.')
        return
      }
      const text = data.choices[0].message.content
      setAiInsight(text)
    } catch (err) {
      setAiInsight('Unable to load AI insights right now.')
    } finally {
      setAiLoading(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = summary[summary.length - 1]?.totalAmount || 0
  const lastMonth = summary[summary.length - 2]?.totalAmount || 0
  const monthChange = lastMonth ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : 0

  const categoryData = expenses.reduce((acc, e) => {
    const existing = acc.find(item => item.name === e.category)
    if (existing) existing.value += e.amount
    else acc.push({ name: e.category, value: e.amount })
    return acc
  }, [])

  const statCards = [
    {
      title: 'Total Expenses',
      value: `₹${totalExpenses.toLocaleString()}`,
      icon: '💸',
      change: `${expenses.length} transactions`,
      positive: true,
    },
    {
      title: 'This Month',
      value: `₹${thisMonth.toLocaleString()}`,
      icon: '📅',
      change: `${monthChange > 0 ? '+' : ''}${monthChange}% vs last month`,
      positive: monthChange <= 0,
    },
    {
      title: 'Categories',
      value: categoryData.length,
      icon: '🏷️',
      change: 'Active categories',
      positive: true,
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #050008 0%, #0d0015 50%, #050008 100%)' }}>
      <Sidebar />
      <Navbar />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={closeDeleteModal}>
          <div className="rounded-2xl p-8 w-full max-w-sm mx-4"
            style={{
              background: 'rgba(5,0,15,0.98)',
              border: '1px solid rgba(239,68,68,0.3)',
              boxShadow: '0 0 60px rgba(239,68,68,0.15)',
            }}
            onClick={e => e.stopPropagation()}>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                🗑️
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Delete Expense</h3>
              <p className="text-gray-400 text-sm">Are you sure you want to delete</p>
              <p className="font-semibold mt-1" style={{ color: '#f87171' }}>"{deleteModal.title}"?</p>
              <p className="text-gray-600 text-xs mt-2">This action cannot be undone.</p>
            </div>

            <div className="w-full h-px mb-6" style={{ background: 'rgba(239,68,68,0.2)' }} />

            <div className="flex gap-3">
              <button onClick={closeDeleteModal}
                className="flex-1 py-3 rounded-xl text-gray-400 font-semibold transition-all text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(124,58,237,0.5)'}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(124,58,237,0.2)'}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl text-white font-bold transition-all text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #991b1b, #ef4444)', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(239,68,68,0.7)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(239,68,68,0.4)'}>
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </span>
                ) : '🗑️ Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ml-64 pt-20 p-8">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .card-animate { animation: fadeInUp 0.6s ease forwards; }
        `}</style>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
              <p style={{ color: 'rgba(167,139,250,0.7)' }}>Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statCards.map((card, i) => (
                <div key={i} className="card-animate rounded-2xl p-6"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    background: 'rgba(5,0,15,0.8)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    boxShadow: '0 0 30px rgba(124,58,237,0.08)',
                  }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{card.icon}</span>
                    <span className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: card.positive ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                        border: card.positive ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(239,68,68,0.2)',
                        color: card.positive ? '#4ade80' : '#f87171'
                      }}>
                      {card.change}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{card.title}</p>
                  <p className="text-white text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {/* Area Chart */}
              <div className="card-animate rounded-2xl p-6"
                style={{ animationDelay: '0.3s', background: 'rgba(5,0,15,0.8)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                  📈 <span>Monthly Spending Trend</span>
                </h3>
                {summary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={summary}>
                      <defs>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="_id" stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                      <YAxis stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: 'rgba(5,0,15,0.95)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '12px', color: 'white' }} />
                      <Area type="monotone" dataKey="totalAmount" stroke="#a855f7" strokeWidth={2} fill="url(#purpleGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-600">
                    No data yet — add some expenses!
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="card-animate rounded-2xl p-6"
                style={{ animationDelay: '0.4s', background: 'rgba(5,0,15,0.8)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                  🍩 <span>Spending by Category</span>
                </h3>
                {categoryData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={180}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                          {categoryData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'rgba(5,0,15,0.95)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '12px', color: 'white' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {categoryData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-xs text-gray-400">{item.name}</span>
                          </div>
                          <span className="text-xs text-white font-medium">₹{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-600">
                    No data yet — add some expenses!
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent Transactions */}
              <div className="card-animate rounded-2xl p-6"
                style={{ animationDelay: '0.5s', background: 'rgba(5,0,15,0.8)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    🧾 <span>Recent Transactions</span>
                  </h3>
                  <button onClick={() => navigate('/add-expense')}
                    className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a855f7' }}>
                    + Add New
                  </button>
                </div>
                <div className="space-y-3">
                  {expenses.length > 0 ? expenses.map((expense, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-all"
                      style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}
                      onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(124,58,237,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(124,58,237,0.1)'}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ background: 'rgba(124,58,237,0.2)' }}>
                          {categoryIcons[expense.category] || '💰'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{expense.title}</p>
                          <p className="text-xs" style={{ color: 'rgba(167,139,250,0.5)' }}>
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold text-sm">-₹{expense.amount}</span>
                        <button onClick={() => navigate(`/edit-expense/${expense._id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)', color: '#a855f7' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(124,58,237,0.35)'
                            e.currentTarget.style.boxShadow = '0 0 10px rgba(124,58,237,0.4)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => openDeleteModal(expense._id, expense.title)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.25)'
                            e.currentTarget.style.boxShadow = '0 0 10px rgba(239,68,68,0.3)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-600">
                      <p className="text-4xl mb-2">💸</p>
                      <p>No expenses yet!</p>
                      <button onClick={() => navigate('/add-expense')}
                        className="mt-3 text-purple-400 text-sm hover:text-purple-300">
                        Add your first expense →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div className="card-animate rounded-2xl p-6"
                style={{ animationDelay: '0.6s', background: 'rgba(5,0,15,0.8)', border: '1px solid rgba(124,58,237,0.25)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    🤖 <span>AI Financial Insights</span>
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a855f7' }}>
                    Powered by Groq AI
                  </span>
                </div>

                {!aiInsight ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🧠</div>
                    <p className="text-gray-400 mb-6 text-sm">
                      Get personalized AI insights about your spending patterns
                    </p>
                    <button onClick={fetchAiInsight} disabled={aiLoading}
                      className="px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
                      {aiLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Analyzing...
                        </span>
                      ) : '✨ Generate AI Insights'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="p-4 rounded-xl mb-4"
                      style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{aiInsight}</p>
                    </div>
                    <button onClick={fetchAiInsight} disabled={aiLoading}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      🔄 Refresh insights
                    </button>
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}