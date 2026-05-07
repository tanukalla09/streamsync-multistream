import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Video, Radio, History,
  Users, Film, Activity, Key,
  DollarSign, Lightbulb, BarChart2, KeyRound, UserPlus, Tv2
} from 'lucide-react'

const SectionLabel = ({ label }) => (
  <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-4 pt-4 pb-1">
    {label}
  </p>
)

const SidebarLink = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
        isActive
          ? 'bg-purple-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
)

export default function Sidebar() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return (
      <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
        <nav className="space-y-0.5">

          <SectionLabel label="Overview" />
          <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />} label="Admin Dashboard" />

          <SectionLabel label="Content" />
          <SidebarLink to="/admin/users"   icon={<Users size={18} />}    label="Manage Users" />
          <SidebarLink to="/admin/videos"  icon={<Film size={18} />}     label="Manage Videos" />
          <SidebarLink to="/admin/streams" icon={<Activity size={18} />} label="Manage Streams" />

          <SectionLabel label="Analytics" />
          <SidebarLink to="/admin/platform-popularity"   icon={<BarChart2 size={18} />} label="Platform Popularity" />
          <SidebarLink to="/admin/stream-keys-saved"     icon={<KeyRound size={18} />}  label="Stream Keys Saved" />
          <SidebarLink to="/admin/recent-registrations"  icon={<UserPlus size={18} />}  label="Recent Registrations" />

          <SectionLabel label="Live" />
          <SidebarLink to="/admin/live-stats" icon={<Tv2 size={18} />} label="Live Stats" />

        </nav>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
      <nav className="space-y-0.5">

        <SectionLabel label="Main" />
        <SidebarLink to="/dashboard"   icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarLink to="/my-videos"   icon={<Video size={18} />}           label="My Videos" />
        <SidebarLink to="/stream"      icon={<Radio size={18} />}           label="Go Live" />
        <SidebarLink to="/history"     icon={<History size={18} />}         label="History" />
        <SidebarLink to="/stream-keys" icon={<Key size={18} />}             label="Stream Keys" />

        <SectionLabel label="Live" />
        <SidebarLink to="/live-stats" icon={<Tv2 size={18} />} label="Live Stats" />

        <SectionLabel label="Resources" />
        <SidebarLink to="/streaming-tips" icon={<Lightbulb size={18} />}  label="Streaming Tips" />
        <SidebarLink to="/monetization"   icon={<DollarSign size={18} />} label="How Platforms Pay You" />

      </nav>
    </aside>
  )
}