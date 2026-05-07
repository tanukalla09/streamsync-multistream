import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../utils/axios'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { Radio, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const platforms = [
  { name: 'YouTube',   color: '#FF0000' },
  { name: 'Twitch',    color: '#9146FF' },
  { name: 'Facebook',  color: '#1877F2' },
  { name: 'Kick',      color: '#53FC18' },
  { name: 'Rumble',    color: '#85C742' },
  { name: 'Instagram', color: '#E1306C' },
  { name: 'Telegram',  color: '#229ED9' },
  { name: 'TikTok',    color: '#ff0050' },
  { name: 'X',         color: '#ffffff' },
  { name: 'BIGO',      color: '#f59e0b' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/auth/login', form)
      login(res.data.token, res.data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await API.post('/auth/google/token', { token: credentialResponse.credential })
      login(res.data.token, res.data.user)
      toast.success('Welcome!')
      navigate('/dashboard')
    } catch {
      toast.error('Google login failed')
    }
  }

  const row1 = platforms.slice(0, 5)
  const row2 = platforms.slice(5, 10)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-purple-900/40 via-gray-900 to-gray-950 p-12 border-r border-gray-800 relative overflow-hidden">

        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="bg-purple-600 p-1.5 rounded-lg">
            <Radio size={18} />
          </div>
          <span className="text-xl font-bold">StreamSync</span>
        </Link>

        <div className="relative z-10">
          <div className="text-5xl font-black mb-4 leading-tight">
            Welcome<br />back 👋
          </div>
          <p className="text-gray-400 text-lg mb-10">
            Log in to access your dashboard and start multistreaming.
          </p>

          {/* Platform pills — 2 clean rows of 5 */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {row1.map(p => (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 13px', borderRadius: '100px',
                  background: `${p.color}15`,
                  border: `1px solid ${p.color}35`,
                  fontSize: '12px', fontWeight: 600, color: '#e5e7eb',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color, boxShadow: `0 0 5px ${p.color}`, flexShrink: 0 }} />
                  {p.name}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {row2.map(p => (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 13px', borderRadius: '100px',
                  background: `${p.color}15`,
                  border: `1px solid ${p.color}35`,
                  fontSize: '12px', fontWeight: 600, color: '#e5e7eb',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color, boxShadow: `0 0 5px ${p.color}`, flexShrink: 0 }} />
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-xs mt-6">Stream to all 10 platforms simultaneously</p>
        </div>

        <p className="text-gray-700 text-xs relative z-10">© 2026 StreamSync — Purple Merit, Bengaluru</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">

          <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-8 transition">
            <ArrowLeft size={15} /> Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Radio size={18} />
            </div>
            <span className="text-xl font-bold">StreamSync</span>
          </div>

          <h2 className="text-3xl font-black mb-1">Login</h2>
          <p className="text-gray-400 mb-8 text-sm">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" required
                className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 outline-none border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 pr-12 outline-none border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:-translate-y-0.5 text-sm">
              {loading ? 'Logging in...' : 'Login to Dashboard →'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-800"></div>
            <span className="px-4 text-gray-600 text-xs">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              theme="filled_black" shape="rectangular" width="400"
            />
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition">
              Register for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}