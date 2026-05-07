import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../utils/axios'
import toast from 'react-hot-toast'
import { Radio, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'

const perks = [
  'Stream to 10 platforms simultaneously',
  'Upload videos up to 2GB',
  'Real-time stream monitoring',
  'Full stream history & analytics',
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!agreedToTerms) return toast.error('Please read and agree to the Terms & Conditions first')
    setLoading(true)
    try {
      const res = await API.post('/auth/register', form)
      login(res.data.token, res.data.user)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-purple-900/40 via-gray-900 to-gray-950 p-12 border-r border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-purple-600 p-1.5 rounded-lg"><Radio size={18} /></div>
          <span className="text-xl font-bold">StreamSync</span>
        </Link>
        <div>
          <div className="text-5xl font-black mb-4 leading-tight">
            Start streaming<br />for free 🚀
          </div>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of creators going live on multiple platforms at once.
          </p>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-purple-600/30 border border-purple-500/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-purple-400" />
                </div>
                <span className="text-gray-300 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-xs">© 2026 StreamSync — Purple Merit</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">

          <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-8 transition">
            <ArrowLeft size={15} /> Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-purple-600 p-1.5 rounded-lg"><Radio size={18} /></div>
            <span className="text-xl font-bold">StreamSync</span>
          </div>

          <h2 className="text-3xl font-black mb-1">Create account</h2>
          <p className="text-gray-400 mb-8 text-sm">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wide">Full Name</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Your name" required
                className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 outline-none border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm"
              />
            </div>

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
                  placeholder="Min. 6 characters" required
                  className="w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 pr-12 outline-none border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* T&C Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer border-2 transition shrink-0 mt-0.5 ${
                  agreedToTerms
                    ? 'bg-purple-600 border-purple-600'
                    : 'bg-gray-900 border-gray-600 hover:border-purple-500'
                }`}
              >
                {agreedToTerms && <Check size={12} className="text-white" />}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                I have read and agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition"
                >
                  Terms & Conditions
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:-translate-y-0.5 text-sm"
            >
              {loading ? 'Creating account...' : 'Create Free Account →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}