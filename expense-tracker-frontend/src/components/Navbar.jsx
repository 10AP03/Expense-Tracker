import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="fixed top-0 left-64 right-0 z-40 px-8 py-4 flex items-center justify-between"
      style={{
        background: 'rgba(5, 0, 15, 0.9)',
        borderBottom: '1px solid rgba(124,58,237,0.15)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Greeting */}
      <div>
        <h2 className="text-white font-bold text-xl">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
        </h2>
        <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>
          Your personal finance command center
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Date */}
        <div className="text-right hidden md:block">
          <p className="text-white text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
            boxShadow: '0 0 15px rgba(124,58,237,0.4)',
          }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>

      </div>
    </div>
  )
}