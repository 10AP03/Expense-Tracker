import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167, 139, 250, ${p.opacity})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050008 0%, #0d0015 50%, #050008 100%)' }}>

      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Subtle glow orbs */}
      <div className="absolute z-0 pointer-events-none"
        style={{ top: '-5%', left: '10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(88,28,135,0.4), transparent)',
          borderRadius: '50%', filter: 'blur(80px)' }} />
      <div className="absolute z-0 pointer-events-none"
        style={{ bottom: '-5%', right: '10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(109,40,217,0.3), transparent)',
          borderRadius: '50%', filter: 'blur(80px)' }} />
      <div className="absolute z-0 pointer-events-none"
        style={{ top: '40%', left: '40%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)',
          borderRadius: '50%', filter: 'blur(60px)' }} />

      {/* Diagonal lines decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute"
            style={{
              left: `${-20 + i * 25}%`,
              top: '-50%',
              width: '1px',
              height: '200%',
              background: `linear-gradient(to bottom, transparent, rgba(124,58,237,${0.08 + i * 0.01}), transparent)`,
              transform: 'rotate(25deg)',
            }} />
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .fade-in-up { animation: fadeInUp 0.9s ease forwards; }
        .float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 w-full max-w-md px-6 fade-in-up">

        {/* Logo */}
        <div className="text-center mb-8 float">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
              boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.2)',
            }}>
            <span className="text-3xl">💸</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight"
            style={{ textShadow: '0 0 30px rgba(167,139,250,0.5)' }}>
            Welcome Back
          </h1>
          <p className="mt-2 text-purple-400 text-sm tracking-widest uppercase">
            Your Personal Finance Command Center
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8"
          style={{
            background: 'rgba(5, 0, 15, 0.85)',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 0 60px rgba(124,58,237,0.15), 0 30px 60px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(30px)',
          }}>

          {/* Card top accent line */}
          <div className="w-full h-px mb-8 rounded-full"
            style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.8), transparent)' }} />

          {error && (
            <div className="mb-5 p-3 rounded-xl text-red-400 text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                style={{ color: 'rgba(167,139,250,0.7)' }}>
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">✉</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
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
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                style={{ color: 'rgba(167,139,250,0.7)' }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">🔑</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
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
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #4c1d95, #7c3aed, #a855f7)',
                boxShadow: '0 0 25px rgba(124,58,237,0.5)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.8)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(124,58,237,0.5)'}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : '⚡ Sign In'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,0.2)' }} />
            <span className="px-4 text-xs" style={{ color: 'rgba(167,139,250,0.4)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,0.2)' }} />
          </div>

          {/* Register link */}
          <p className="text-center text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#a855f7' }}
              onMouseEnter={e => e.target.style.color = '#c084fc'}
              onMouseLeave={e => e.target.style.color = '#a855f7'}>
              Create one free →
            </Link>
          </p>

          {/* Card bottom accent */}
          <div className="w-full h-px mt-8 rounded-full"
            style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.4), transparent)' }} />

        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(124,58,237,0.3)' }}>
          🔒 Secured with JWT Authentication
        </p>

      </div>
    </div>
  )
}