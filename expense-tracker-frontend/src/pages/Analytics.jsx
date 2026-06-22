import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../api/axios'

const filterOptions = [
  { label: 'Daily', value: 'day' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
  { label: 'Yearly', value: 'year' },
]

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚',
  Utilities: '💡', Other: '💰'
}

const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#6d28d9']

export default function Analytics() {
  const [summary, setSummary] = useState([])
  const [expenses, setExpenses] = useState([])
  const [filter, setFilter] = useState('month')
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiForecast, setAiForecast] = useState('')
  const [activeChart, setActiveChart] = useState('area')

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sumRes, expRes] = await Promise.all([
        API.get(`/expenses/summary?type=${filter}`),
        API.get('/expenses?limit=100')
      ])
      setSummary(sumRes.data)
      setExpenses(expRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAiForecast = async () => {
    setAiLoading(true)
    try {
      const prompt = `You are a personal finance AI. Based on this spending data, provide:
1. A spending forecast for next month (1 sentence)
2. Top 2 areas to cut spending (2 bullet points)
3. One positive observation (1 sentence)

Keep it friendly, specific, and actionable. Use emojis.

Spending Summary: ${JSON.stringify(summary)}
All Expenses: ${JSON.stringify(expenses)}`

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
        setAiForecast('Unable to generate forecast right now.')
        return
      }
      const text = data.choices[0].message.content
      setAiForecast(text)
    } catch (err) {
      setAiForecast('Unable to generate forecast right now.')
    } finally {
      setAiLoading(false)
    }
  }

  const categoryData = expenses.reduce((acc, e) => {
    const existing = acc.find(item => item.name === e.category)
    if (existing) existing.value += e.amount
    else acc.push({ name: e.category, value: e.amount })
    return acc
  }, []).sort((a, b) => b.value - a.value)

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const avgPerTransaction = expenses.length ? (totalSpent / expenses.length).toFixed(0) : 0
  const highestExpense = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0)
  const topCategory = categoryData[0]?.name || 'N/A'

  const tooltipStyle = {
    background: 'rgba(5,0,15,0.95)',
    border: '1px solid rgba(124,58,237,0.4)',
    borderRadius: '12px',
    color: 'white'
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
        <div className="flex items-center justify-between mb-8 card-animate">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">📈 Analytics</h1>
            <p style={{ color: 'rgba(167,139,250,0.6)' }}>
              Deep dive into your spending patterns
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 p-1 rounded-xl"
            style={{ background: 'rgba(5,0,15,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
            {filterOptions.map(opt => (
              <button key={opt.value}
                onClick={() => setFilter(opt.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                style={{
                  background: filter === opt.value
                    ? 'linear-gradient(135deg, #4c1d95, #7c3aed)'
                    : 'transparent',
                  color: filter === opt.value ? 'white' : 'rgba(167,139,250,0.5)',
                  boxShadow: filter === opt.value ? '0 0 15px rgba(124,58,237,0.4)' : 'none',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💸', color: '#a855f7' },
            { label: 'Avg per Transaction', value: `₹${Number(avgPerTransaction).toLocaleString()}`, icon: '📊', color: '#c084fc' },
            { label: 'Highest Expense', value: `₹${highestExpense.toLocaleString()}`, icon: '📈', color: '#f87171' },
            { label: 'Top Category', value: `${categoryIcons[topCategory] || '💰'} ${topCategory}`, icon: '🏆', color: '#4ade80' },
          ].map((stat, i) => (
            <div key={i} className="card-animate rounded-2xl p-5"
              style={{
                animationDelay: `${i * 0.1}s`,
                background: 'rgba(5,0,15,0.8)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart Type Selector + Main Chart */}
        <div className="card-animate rounded-2xl p-6 mb-8"
          style={{
            animationDelay: '0.4s',
            background: 'rgba(5,0,15,0.8)',
            border: '1px solid rgba(124,58,237,0.25)',
          }}>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Spending Over Time</h3>
            <div className="flex gap-2">
              {[
                { key: 'area', label: '📉 Area' },
                { key: 'bar', label: '📊 Bar' },
                { key: 'line', label: '📈 Line' },
              ].map(chart => (
                <button key={chart.key}
                  onClick={() => setActiveChart(chart.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeChart === chart.key
                      ? 'linear-gradient(135deg, #4c1d95, #7c3aed)'
                      : 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    color: activeChart === chart.key ? 'white' : 'rgba(167,139,250,0.6)',
                    boxShadow: activeChart === chart.key ? '0 0 15px rgba(124,58,237,0.4)' : 'none',
                  }}>
                  {chart.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : summary.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              {activeChart === 'area' ? (
                <AreaChart data={summary}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="_id" stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                  <YAxis stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="totalAmount" stroke="#a855f7" strokeWidth={2} fill="url(#grad1)" name="Amount (₹)" />
                </AreaChart>
              ) : activeChart === 'bar' ? (
                <BarChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="_id" stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                  <YAxis stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="totalAmount" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Amount (₹)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.6))' }} />
                </BarChart>
              ) : (
                <LineChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="_id" stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                  <YAxis stroke="rgba(167,139,250,0.3)" tick={{ fill: 'rgba(167,139,250,0.6)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="totalAmount" stroke="#a855f7" strokeWidth={3}
                    dot={{ fill: '#7c3aed', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#c084fc' }}
                    name="Amount (₹)" />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <p className="text-4xl mb-2">📊</p>
                <p>No data for this period — add some expenses!</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Category Breakdown */}
          <div className="card-animate rounded-2xl p-6"
            style={{
              animationDelay: '0.5s',
              background: 'rgba(5,0,15,0.8)',
              border: '1px solid rgba(124,58,237,0.25)',
            }}>
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              🏷️ <span>Category Breakdown</span>
            </h3>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.map((cat, i) => {
                  const percentage = ((cat.value / totalSpent) * 100).toFixed(1)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span>{categoryIcons[cat.name] || '💰'}</span>
                          <span className="text-sm text-gray-300">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>{percentage}%</span>
                          <span className="text-sm font-semibold text-white">₹{cat.value.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: 'rgba(124,58,237,0.1)' }}>
                        <div className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(to right, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                            boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}80`
                          }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-600">
                No category data yet!
              </div>
            )}
          </div>

          {/* AI Forecast */}
          <div className="card-animate rounded-2xl p-6"
            style={{
              animationDelay: '0.6s',
              background: 'rgba(5,0,15,0.8)',
              border: '1px solid rgba(124,58,237,0.25)',
            }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                🔮 <span>AI Spending Forecast</span>
              </h3>
              <span className="text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a855f7' }}>
                Groq AI
              </span>
            </div>

            {!aiForecast ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔮</div>
                <p className="text-gray-400 text-sm mb-6">
                  Get AI predictions for your next month spending
                </p>
                <button onClick={fetchAiForecast} disabled={aiLoading}
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
                      Forecasting...
                    </span>
                  ) : '🔮 Generate Forecast'}
                </button>
              </div>
            ) : (
              <div>
                <div className="p-4 rounded-xl mb-4"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{aiForecast}</p>
                </div>
                <button onClick={fetchAiForecast} disabled={aiLoading}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  🔄 Regenerate forecast
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}