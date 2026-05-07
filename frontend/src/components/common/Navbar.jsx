import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link to="/dashboard" className="text-2xl font-bold text-purple-500">
        StreamSync
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <NotificationBell />
            <div className="flex items-center gap-2">
              {user.avatar && (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-gray-300 text-sm">{user.name}</span>
              {user.role === 'admin' && (
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}