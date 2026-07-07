import { useState, useEffect, useRef } from 'react'
import API from '../api/axios'

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your AI finance assistant. Ask me anything about your expenses!\n\nTry asking:\n• How much did I spend this month?\n• What's my biggest expense category?\n• Give me budget tips"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [fetching, setFetching] = useState(false)
  const messagesEndRef = useRef(null)

  // Fetch expenses every time chat is opened
  useEffect(() => {
    if (open) {
      fetchExpenses()
      scrollToBottom()
    }
  }, [open])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [messages])

  const fetchExpenses = async () => {
    setFetching(true)
    try {
      const res = await API.get('/expenses?limit=100')
      setExpenses(res.data)
      console.log('Fetched expenses:', res.data)
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setFetching(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = updatedMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')

      // Calculate stats from real data
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
      const categories = [...new Set(expenses.map(e => e.category))]
      const categoryBreakdown = categories.map(cat => {
        const catExpenses = expenses.filter(e => e.category === cat)
        const total = catExpenses.reduce((sum, e) => sum + e.amount, 0)
        return { category: cat, total, count: catExpenses.length }
      })

      const prompt = `You are a helpful personal finance AI assistant integrated into an expense tracker app.
You have access to the user's REAL expense data below. Always answer based on this exact data.
Be concise, friendly, and use emojis.

=== USER'S REAL EXPENSE DATA ===
Total number of expenses: ${expenses.length}
Total amount spent: ₹${totalSpent}
All expenses: ${JSON.stringify(expenses)}
Category breakdown: ${JSON.stringify(categoryBreakdown)}
=================================

If the user asks about their expenses, always use the above data to answer.
If there are no expenses (length is 0), tell them they have no expenses recorded yet.
Never make up or assume any expense data.

Conversation history:
${conversationHistory}

Please respond to the latest user message based on their real data above.`

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
      console.log('Groq Response:', data)

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error: ${data.error.message}`
        }])
        return
      }

      const text = data.choices[0].message.content
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text
      }])
    } catch (err) {
      console.error('Error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I could not process that. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    'How much did I spend this month?',
    'What is my top expense category?',
    'Give me budget saving tips',
    'Analyze my spending habits',
  ]

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.5); }
          50% { box-shadow: 0 0 40px rgba(124,58,237,0.9), 0 0 60px rgba(168,85,247,0.4); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .chat-window { animation: slideUp 0.3s ease forwards; }
        .chat-bubble { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 rounded-3xl overflow-hidden chat-window"
          style={{
            background: 'rgba(5,0,15,0.98)',
            border: '1px solid rgba(124,58,237,0.4)',
            boxShadow: '0 0 60px rgba(124,58,237,0.3), 0 30px 60px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(30px)',
            height: '560px',
            display: 'flex',
            flexDirection: 'column',
          }}>

          {/* Header */}
          <div className="p-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(76,29,149,0.8), rgba(124,58,237,0.6))',
              borderBottom: '1px solid rgba(124,58,237,0.3)',
            }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm">SpendAI Assistant</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs" style={{ color: 'rgba(167,139,250,0.8)' }}>
                    {fetching ? 'Loading your data...' : 'Online • Powered by Groq AI'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button onClick={fetchExpenses}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                title="Refresh expense data">
                🔄
              </button>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Data loaded indicator */}
          {expenses.length > 0 && (
            <div className="px-4 py-2 text-xs flex items-center gap-2"
              style={{
                background: 'rgba(74,222,128,0.05)',
                borderBottom: '1px solid rgba(74,222,128,0.1)',
                color: 'rgba(74,222,128,0.7)'
              }}>
              ✅ Loaded {expenses.length} expenses • Total: ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#7c3aed transparent' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}>
                    🤖
                  </div>
                )}
                <div className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                    color: 'white',
                    borderBottomRightRadius: '4px',
                    boxShadow: '0 0 15px rgba(124,58,237,0.3)',
                  } : {
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    color: '#e2e8f0',
                    borderBottomLeftRadius: '4px',
                  }}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mr-2"
                  style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}>
                  🤖
                </div>
                <div className="px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderBottomLeftRadius: '4px'
                  }}>
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-purple-400"
                        style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs mb-2" style={{ color: 'rgba(167,139,250,0.5)' }}>Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button key={i}
                    onClick={() => {
                      setInput(q)
                      setTimeout(() => sendMessage(), 100)
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: 'rgba(167,139,250,0.8)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances..."
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm placeholder-gray-700 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(124,58,237,0.25)',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(124,58,237,0.7)'
                  e.target.style.boxShadow = '0 0 15px rgba(124,58,237,0.15)'
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(124,58,237,0.25)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{
                  background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                  boxShadow: '0 0 15px rgba(124,58,237,0.4)',
                }}>
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 chat-bubble"
        style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {open ? '✕' : '🤖'}
      </button>
    </>
  )
}