import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/user/DashboardPage'
import MyVideosPage from './pages/user/MyVideosPage'
import StreamPage from './pages/user/StreamPage'
import HistoryPage from './pages/user/HistoryPage'
import StreamKeysPage from './pages/user/StreamKeysPage'
import StreamingTipsPage from './pages/user/StreamingTipsPage'
import MonetizationPage from './pages/user/MonetizationPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageVideos from './pages/admin/ManageVideos'
import ManageStreams from './pages/admin/ManageStreams'
import PlatformPopularityPage from './pages/admin/PlatformPopularityPage'
import StreamKeysSavedPage from './pages/admin/StreamKeysSavedPage'
import RecentRegistrationsPage from './pages/admin/RecentRegistrationsPage'
import Loader from './components/common/Loader'
import TermsPage from './pages/TermsPage'
import LiveStatsPage from './pages/user/LiveStatsPage'
import AdminLiveStatsPage from './pages/admin/AdminLiveStatsPage'
import StreamStatus from './components/stream/StreamStatus'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ StreamStatus is OUTSIDE <Routes> so it persists on all pages */}
      <StreamStatus />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Routes */}
        <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/my-videos"      element={<ProtectedRoute><MyVideosPage /></ProtectedRoute>} />
        <Route path="/stream"         element={<ProtectedRoute><StreamPage /></ProtectedRoute>} />
        <Route path="/history"        element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/stream-keys"    element={<ProtectedRoute><StreamKeysPage /></ProtectedRoute>} />
        <Route path="/streaming-tips" element={<ProtectedRoute><StreamingTipsPage /></ProtectedRoute>} />
        <Route path="/monetization"   element={<ProtectedRoute><MonetizationPage /></ProtectedRoute>} />
        <Route path="/live-stats"     element={<ProtectedRoute><LiveStatsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin"                       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users"                 element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="/admin/videos"                element={<AdminRoute><ManageVideos /></AdminRoute>} />
        <Route path="/admin/streams"               element={<AdminRoute><ManageStreams /></AdminRoute>} />
        <Route path="/admin/platform-popularity"   element={<AdminRoute><PlatformPopularityPage /></AdminRoute>} />
        <Route path="/admin/stream-keys-saved"     element={<AdminRoute><StreamKeysSavedPage /></AdminRoute>} />
        <Route path="/admin/recent-registrations"  element={<AdminRoute><RecentRegistrationsPage /></AdminRoute>} />
        <Route path="/admin/live-stats"            element={<AdminRoute><AdminLiveStatsPage /></AdminRoute>} />

        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  )
}