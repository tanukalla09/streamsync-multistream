import { useEffect, useState } from 'react'
import API from '../../utils/axios'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Trash2, Users, X, AlertTriangle } from 'lucide-react'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null) // { id, name, email }
  const [reason, setReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    API.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const openDeleteModal = (user) => {
    setDeleteModal(user)
    setReason('')
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
    setReason('')
  }

  const handleDelete = async () => {
    if (!reason.trim()) return toast.error('Please provide a reason for deletion')
    setDeleting(true)
    try {
      await API.delete(`/admin/users/${deleteModal._id}`, { data: { reason } })
      setUsers(users.filter(u => u._id !== deleteModal._id))
      toast.success('User deleted and email sent')
      closeDeleteModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-gray-400 mb-8">View and manage all registered users.</p>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              All Users
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left pb-3 pr-4">Name</th>
                      <th className="text-left pb-3 pr-4">Email</th>
                      <th className="text-left pb-3 pr-4">Role</th>
                      <th className="text-left pb-3 pr-4">Joined</th>
                      <th className="text-left pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {u.avatar
                              ? <img src={u.avatar} className="w-7 h-7 rounded-full" />
                              : <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">{u.name[0]}</div>
                            }
                            {u.name}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Delete User</h3>
                  <p className="text-gray-500 text-xs">This action cannot be undone</p>
                </div>
              </div>
              <button onClick={closeDeleteModal} className="text-gray-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* User info */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-white font-medium">{deleteModal.name}</p>
              <p className="text-gray-400 text-sm">{deleteModal.email}</p>
            </div>

            {/* Reason input */}
            <div className="mb-4">
              <label className="text-gray-400 text-xs font-medium mb-2 block uppercase tracking-wide">
                Reason for deletion <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Violation of terms of service, spam activity, inappropriate content..."
                rows={3}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-red-500 transition resize-none"
              />
              <p className="text-gray-600 text-xs mt-1">
                This reason will be sent to the user via email.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || !reason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition text-sm"
              >
                {deleting ? 'Deleting...' : 'Delete & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}