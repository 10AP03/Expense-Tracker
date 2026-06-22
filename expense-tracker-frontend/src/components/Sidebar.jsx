import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/add-expense', icon: '➕', label: 'Add Expense' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{
        background: 'rgba(5, 0, 15, 0.95)',
        borderRight: '1px solid rgba(124,58,237,0.2)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Logo */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
            }}>
            <span className="text-lg">💸</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">SpendAI</h1>
            <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>Expense Tracker</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px mb-6" style={{ background: 'rgba(124,58,237,0.2)' }} />

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(76,29,149,0.5), rgba(124,58,237,0.3))',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 20px rgba(124,58,237,0.2)',
            } : {
              border: '1px solid transparent',
            }}>
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <div className="mx-2 h-px mb-4" style={{ background: 'rgba(124,58,237,0.2)' }} />
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 transition-all duration-300"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.border = '1px solid rgba(239,68,68,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.border = '1px solid transparent'
          }}>
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>

    </div>
  )
}