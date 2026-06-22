import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../api/axios.js'

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other']

const categoryIcons = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Education: '📚',
  Utilities: '💡', Other: '💰'
}

export default function AddEditExpense() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEdit) fetchExpense()
  }, [id])

  const fetchExpense = async () => {
    try {
      const res = await API.get(`/expenses`)
      const expense = res.data.find(e => e._id === id)
      if (expense) {
        setForm({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: new Date(expense.date).toISOString().split('T')[0]
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // AI Category Suggestion
  const getAiCategorySuggestion = async (title) => {
    if (!title || title.length < 3) return
    setAiLoading(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Based on this expense title: "${title}", suggest the most appropriate category from this list: Food, Transport, Shopping, Entertainment, Health, Education, Utilities, Other.
            
Reply with ONLY the category name, nothing else. No explanation, no punctuation, just the category word.`
          }]
        })
      })
      const data = await response.json()
      const suggested = data.content[0].text.trim()
      if (categories.includes(suggested)) {
        setAiSuggestion(suggested)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleTitleChange = (e) => {
    const value = e.target.value
    setForm({ ...form, title: value })
    // Debounce AI call
    clearTimeout(window.aiTimer)
    window.aiTimer = setTimeout(() => {
      getAiCategorySuggestion(value)
    }, 800)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const applyAiSuggestion = () => {
    setForm({ ...form, category: aiSuggestion })
    setAiSuggestion('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isEdit) {
        await API.put(`/expenses/${id}`, form)
        setSuccess('Expense updated successfully!')
      } else {
        await API.post('/expenses', form)
        setSuccess('Expense added successfully!')
      }
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
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
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .fade-in { animation: fadeInUp 0.6s ease forwards; }
          .slide-in { animation: slideIn 0.3s ease forwards; }
        `}</style>

        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-white mb-1">
            {isEdit ? '✏️ Edit Expense' : '➕ Add New Expense'}
          </h1>
          <p style={{ color: 'rgba(167,139,250,0.6)' }}>
            {isEdit ? 'Update your expense details' : 'Track your spending with AI-powered categorization'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Form */}
          <div className="lg:col-span-2 fade-in">
            <div className="rounded-2xl p-8"
              style={{
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
                boxShadow: '0 0 40px rgba(124,58,237,0.08)',
              }}>

              {/* Top accent */}
              <div className="w-full h-px mb-8"
                style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.8), transparent)' }} />

              {error && (
                <div className="mb-6 p-4 rounded-xl text-red-400 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl text-green-400 text-sm"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Expense Title
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">📝</span>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Lunch at restaurant, Uber ride..."
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-700 focus:outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(124,58,237,0.25)',
                      }}
                      onFocus={e => {
                        e.target.style.border = '1px solid rgba(124,58,237,0.7)'
                        e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'
                      }}
                      onBlur={e => {
                        e.target.style.border = '1px solid rgba(124,58,237,0.25)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    {/* AI Loading indicator */}
                    {aiLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* AI Suggestion */}
                  {aiSuggestion && !aiLoading && (
                    <div className="mt-3 slide-in flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: 'rgba(124,58,237,0.1)',
                        border: '1px solid rgba(124,58,237,0.3)',
                      }}>
                      <span className="text-purple-400 text-xs">🤖 AI suggests:</span>
                      <span className="text-white text-sm font-medium">
                        {categoryIcons[aiSuggestion]} {aiSuggestion}
                      </span>
                      <button type="button" onClick={applyAiSuggestion}
                        className="ml-auto text-xs px-3 py-1 rounded-lg font-medium text-white transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                          boxShadow: '0 0 10px rgba(124,58,237,0.4)',
                        }}>
                        Apply ✓
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 font-bold">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-700 focus:outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(124,58,237,0.25)',
                      }}
                      onFocus={e => {
                        e.target.style.border = '1px solid rgba(124,58,237,0.7)'
                        e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'
                      }}
                      onBlur={e => {
                        e.target.style.border = '1px solid rgba(124,58,237,0.25)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {categories.map(cat => (
                      <button key={cat} type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className="p-3 rounded-xl text-center transition-all duration-300"
                        style={{
                          background: form.category === cat
                            ? 'linear-gradient(135deg, #4c1d95, #7c3aed)'
                            : 'rgba(255,255,255,0.03)',
                          border: form.category === cat
                            ? '1px solid rgba(124,58,237,0.8)'
                            : '1px solid rgba(124,58,237,0.15)',
                          boxShadow: form.category === cat
                            ? '0 0 15px rgba(124,58,237,0.4)'
                            : 'none',
                        }}>
                        <div className="text-xl mb-1">{categoryIcons[cat]}</div>
                        <div className="text-xs text-white">{cat}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">📅</span>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white focus:outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(124,58,237,0.25)',
                        colorScheme: 'dark',
                      }}
                      onFocus={e => {
                        e.target.style.border = '1px solid rgba(124,58,237,0.7)'
                        e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'
                      }}
                      onBlur={e => {
                        e.target.style.border = '1px solid rgba(124,58,237,0.25)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => navigate('/dashboard')}
                    className="flex-1 py-3 rounded-xl text-gray-400 font-semibold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(124,58,237,0.15)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(124,58,237,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(124,58,237,0.15)'}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-2 flex-grow py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #4c1d95, #7c3aed, #a855f7)',
                      boxShadow: '0 0 25px rgba(124,58,237,0.5)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(124,58,237,0.5)'}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {isEdit ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (isEdit ? '✏️ Update Expense' : '➕ Add Expense')}
                  </button>
                </div>

              </form>

              {/* Bottom accent */}
              <div className="w-full h-px mt-8"
                style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)' }} />

            </div>
          </div>

          {/* Right Panel — Tips */}
          <div className="space-y-6">

            {/* AI Tips Card */}
            <div className="fade-in rounded-2xl p-6"
              style={{
                animationDelay: '0.2s',
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
              }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                🤖 <span>AI Smart Tips</span>
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '⚡', text: 'Type your expense title and AI will auto-suggest the category' },
                  { icon: '🎯', text: 'Select a category manually if AI suggestion doesn\'t match' },
                  { icon: '📅', text: 'Set the correct date for accurate monthly reports' },
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
                    <span>{tip.icon}</span>
                    <p className="text-xs text-gray-400 leading-relaxed">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="fade-in rounded-2xl p-6"
              style={{
                animationDelay: '0.3s',
                background: 'rgba(5,0,15,0.85)',
                border: '1px solid rgba(124,58,237,0.25)',
              }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                📊 <span>Quick Categories</span>
              </h3>
              <div className="space-y-2">
                {categories.map((cat, i) => (
                  <button key={i} type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className="w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left"
                    style={{ color: form.category === cat ? '#a855f7' : 'rgba(156,163,175,0.7)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{categoryIcons[cat]}</span>
                    <span className="text-sm">{cat}</span>
                    {form.category === cat && <span className="ml-auto text-purple-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}