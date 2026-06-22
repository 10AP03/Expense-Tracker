import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiBudget, setAiBudget] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        API.get('/expenses?limit=100'),
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

  const fetchAiBudget = async () => {
    setAiLoading(true)
    try {
      const prompt = `You are a personal finance AI advisor. Based on this user's spending data, create a personalized monthly budget plan.

For each category they spend in, suggest a budget limit.
Also give 2-3 money saving tips specific to their spending.
Keep it friendly and use emojis.
Format with clear sections.

User: ${user?.name}
Expenses: ${JSON.stringify(expenses)}
Monthly Summary: ${JSON.stringify(summary)}`

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
        setAiBudget('Unable to generate budget plan right now.')
        return
      }
      const text = data.choices[0].message.content
      setAiBudget(text)
    } catch (err) {
      setAiBudget('Unable to generate budget plan right now.')
    } finally {
      setAiLoading(false)
    }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = summary[summary.length - 1]?.totalAmount || 0
  const totalTransactions = expenses.length

  const categoryData = expenses.reduce((acc, e) => {
    const existing = acc.find(item => item.name === e.category)
    if (existing) existing.value += e.amount
    else acc.push({ name: e.category, value: e.amount })
    return acc
  }, []).sort((a, b) => b.value - a.value)

  const categoryIcons = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️',
    Entertainment: '🎬', Health: '💊', Education: '📚',
    Utilities: '💡', Other: '💰'
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #050008 0%, #0d0015 50%, #050008 100%)' }}>
      <Sidebar />
      <Navbar />

      <div className="ml-64 pt-20 p-8">

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .card-animate { animation: fadeInUp 0.6s ease forwards; }
        `}</style>

        {/* Header */}
        <div className="mb-8 card-animate">
          <h1 className="text-3xl font-bold text-white mb-1">👤 Profile</h1>
          <p style={{ color: 'rgba(167,139,250,0.6)' }}>Your account and AI budget recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Profile Card */}
            <div className="card-animate rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
                boxShadow: '0 0 40px rgba(124,58,237,0.08)',
              }}>

              <div className="w-full h-px mb-6"
                style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.8), transparent)' }} />

              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.5)',
                }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <h2 className="text-white text-xl font-bold mb-1">{user?.name}</h2>
              <p className="text-sm mb-4" style={{ color: 'rgba(167,139,250,0.6)' }}>{user?.email}</p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
                style={{
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  color: '#4ade80'
                }}>
                ✅ Active Account
              </div>

              <div className="w-full h-px mt-6"
                style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)' }} />
            </div>

            {/* Quick Stats */}
            <div className="card-animate rounded-2xl p-6"
              style={{
                animationDelay: '0.1s',
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
              }}>
              <h3 className="text-white font-semibold mb-4">📊 Your Stats</h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💸' },
                  { label: 'This Month', value: `₹${thisMonth.toLocaleString()}`, icon: '📅' },
                  { label: 'Total Transactions', value: totalTransactions, icon: '🧾' },
                  { label: 'Categories Used', value: categoryData.length, icon: '🏷️' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
                    <div className="flex items-center gap-2">
                      <span>{stat.icon}</span>
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className="card-animate" style={{ animationDelay: '0.2s' }}>
              <button onClick={handleLogout}
                className="w-full py-3 rounded-xl font-semibold transition-all text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(239,68,68,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                🚪 Logout
              </button>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Top Categories */}
            <div className="card-animate rounded-2xl p-6"
              style={{
                animationDelay: '0.2s',
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
              }}>
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                🏆 <span>Top Spending Categories</span>
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                </div>
              ) : categoryData.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {categoryData.slice(0, 6).map((cat, i) => {
                    const percentage = ((cat.value / totalSpent) * 100).toFixed(1)
                    const colors = ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#6d28d9']
                    return (
                      <div key={i} className="p-4 rounded-xl"
                        style={{
                          background: 'rgba(124,58,237,0.06)',
                          border: `1px solid ${colors[i % colors.length]}30`
                        }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{categoryIcons[cat.name] || '💰'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${colors[i % colors.length]}20`, color: colors[i % colors.length] }}>
                            {percentage}%
                          </span>
                        </div>
                        <p className="text-white font-semibold text-sm">{cat.name}</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(167,139,250,0.6)' }}>
                          ₹{cat.value.toLocaleString()}
                        </p>
                        <div className="w-full h-1.5 rounded-full mt-2" style={{ background: 'rgba(124,58,237,0.1)' }}>
                          <div className="h-1.5 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              background: colors[i % colors.length],
                              boxShadow: `0 0 6px ${colors[i % colors.length]}`
                            }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No expenses yet — start tracking!
                </div>
              )}
            </div>

            {/* AI Budget Plan */}
            <div className="card-animate rounded-2xl p-6"
              style={{
                animationDelay: '0.3s',
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
              }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  💡 <span>AI Budget Recommendations</span>
                </h3>
                <span className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a855f7' }}>
                  Groq AI
                </span>
              </div>

              {!aiBudget ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💡</div>
                  <p className="text-gray-400 text-sm mb-6">
                    Get a personalized monthly budget plan based on your spending habits
                  </p>
                  <button onClick={fetchAiBudget} disabled={aiLoading}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                      boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                    }}>
                    {aiLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating your budget plan...
                      </span>
                    ) : '💡 Generate Budget Plan'}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="p-5 rounded-xl mb-4"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{aiBudget}</p>
                  </div>
                  <button onClick={fetchAiBudget} disabled={aiLoading}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    🔄 Regenerate plan
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}


