import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Plus,
  X,
  ChevronDown,
  Pencil,
  Trash2,
} from 'lucide-react'
import { adjustAdminDashboardCount } from '../../lib/adminDashboardCounts'
import { createUser, deleteUser, getApiErrorMessage, getCompanies, getUsers, updateUser } from '../../services/api'

const defaultUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'company',
  companyId: '',
}

const roleLabels = {
  admin: 'Admin',
  company: 'Company User',
}

const mapUserToDisplay = (user) => ({
  id: user.id,
  name: user.name || 'Unnamed User',
  email: user.email || 'No email added',
  company: user.company_name || 'Platform',
  companyId: user.company_id || '',
  role: roleLabels[user.role] || user.role || 'Company User',
  roleValue: user.role || 'company',
  status: 'Active',
  createdAt: user.created_at || new Date().toISOString(),
})

export default function UsersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [formError, setFormError] = useState('')
  const [activeActionId, setActiveActionId] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState(defaultUserForm)

  const loadUsers = async ({ showErrorToast = true } = {}) => {
    try {
      setIsLoadingUsers(true)
      const response = await getUsers()
      const rows = Array.isArray(response.data) ? response.data : []
      setUsers(rows.map(mapUserToDisplay))
    } catch (error) {
      if (showErrorToast) {
        toast.error(getApiErrorMessage(error, 'Failed to load users'))
      }
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const loadCompanies = async ({ showErrorToast = true } = {}) => {
    try {
      const response = await getCompanies()
      const rows = Array.isArray(response.data) ? response.data : []
      setCompanies(rows)
    } catch (error) {
      if (showErrorToast) {
        toast.error(getApiErrorMessage(error, 'Failed to load companies'))
      }
    }
  }

  useEffect(() => {
    loadUsers({ showErrorToast: true })
    loadCompanies({ showErrorToast: true })
  }, [])

  useEffect(() => {
    const searchPreset = location.state?.searchTerm

    if (!searchPreset) {
      return
    }

    setSearchTerm(searchPreset)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])

  const resetUserForm = () => {
    setUserForm(defaultUserForm)
    setFormError('')
  }

  const openAddModal = () => {
    setActiveActionId(null)
    setEditingUser(null)
    resetUserForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (user) => {
    setActiveActionId(null)
    setEditingUser(user)
    setUserForm({
      name: user.name,
      email: user.email === 'No email added' ? '' : user.email,
      password: '',
      role: user.roleValue,
      companyId: user.companyId ? String(user.companyId) : '',
    })
    setFormError('')
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setEditingUser(null)
    resetUserForm()
  }

  const handleFormChange = (field, value) => {
    setUserForm((current) => ({ ...current, [field]: value }))
  }

  const handleUserSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = userForm.name.trim()
    const trimmedEmail = userForm.email.trim().toLowerCase()
    const trimmedPassword = userForm.password.trim()
    const isCompanyUser = userForm.role === 'company'

    if (!trimmedName || !trimmedEmail || (!editingUser && !trimmedPassword)) {
      setFormError(editingUser ? 'Name and email are required.' : 'Name, email, and password are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Enter a valid email address.')
      return
    }

    if (trimmedPassword && trimmedPassword.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    if (isCompanyUser && !userForm.companyId) {
      setFormError('Choose a company for this user.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      role: userForm.role,
      company_id: isCompanyUser ? userForm.companyId : null,
    }

    if (trimmedPassword) {
      payload.password = trimmedPassword
    }

    try {
      if (editingUser) {
        const response = await updateUser(editingUser.id, payload)
        const updatedUser = mapUserToDisplay(response.data)

        setUsers((current) => current.map((user) => (user.id === editingUser.id ? updatedUser : user)))
        toast.success('User updated successfully')
        closeAddModal()
        return
      }

      const response = await createUser(payload)
      const createdUser = mapUserToDisplay(response.data)
      setUsers((current) => [createdUser, ...current])
      adjustAdminDashboardCount('users', 1)
      toast.success('User added successfully')
      closeAddModal()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to save user')
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (user) => {
    setActiveActionId(null)

    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      adjustAdminDashboardCount('users', -1)
      toast.success('User deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete user'))
    }
  }

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = searchTerm.toLowerCase()
    const matchesSearch =
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.company.toLowerCase().includes(normalizedSearch)
    const matchesRole = roleFilter === 'all' || user.roleValue === roleFilter
    return matchesSearch && matchesRole
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success/10 text-success'
      case 'inactive':
        return 'bg-muted text-muted-foreground'
      case 'suspended':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRoleColor = (roleValue) => {
    return roleValue === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage all users across the platform</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-border bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="company">Company User</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoadingUsers ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No users found yet.</p>
            <p className="mt-2 text-xs text-muted-foreground">Add your first user to start building the admin directory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="font-semibold text-primary">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.company}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex min-w-[76px] items-center justify-center rounded-2xl px-3 py-1.5 text-xs font-medium leading-tight ${getRoleColor(user.roleValue)} ${
                          user.roleValue === 'company' ? 'flex-col text-center' : 'gap-1 whitespace-nowrap'
                        }`}
                      >
                        {user.roleValue === 'admin' && <Shield className="h-3 w-3" />}
                        {user.roleValue === 'company' ? (
                          <>
                            <span>Company</span>
                            <span>User</span>
                          </>
                        ) : (
                          user.role
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={() => setActiveActionId(activeActionId === user.id ? null : user.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-muted"
                          aria-label={`Actions for ${user.name}`}
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {activeActionId === user.id && (
                          <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">1</span>
            <button className="rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-50" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h3>
                <p className="text-sm text-muted-foreground">
                  {editingUser ? 'Update this user account' : 'Create a user and assign platform access'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} autoComplete="off" className="space-y-5 px-6 py-5">
              <div>
                <label htmlFor="user-name" className="mb-2 block text-sm font-medium">
                  Name *
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={userForm.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  placeholder="Avery Johnson"
                  autoComplete="off"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="user-email" className="mb-2 block text-sm font-medium">
                  Email *
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(event) => handleFormChange('email', event.target.value)}
                  placeholder="avery@northwind.com"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="user-role" className="mb-2 block text-sm font-medium">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      id="user-role"
                      value={userForm.role}
                      onChange={(event) => handleFormChange('role', event.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-input px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="company">Company User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="user-company" className="mb-2 block text-sm font-medium">
                    Company {userForm.role === 'company' ? '*' : ''}
                  </label>
                  <div className="relative">
                    <select
                      id="user-company"
                      value={userForm.companyId}
                      onChange={(event) => handleFormChange('companyId', event.target.value)}
                      disabled={userForm.role === 'admin'}
                      className="w-full appearance-none rounded-xl border border-border bg-input px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Select company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="user-password" className="mb-2 block text-sm font-medium">
                  Temporary Password {editingUser ? '' : '*'}
                </label>
                <input
                  id="user-password"
                  type="password"
                  value={userForm.password}
                  onChange={(event) => handleFormChange('password', event.target.value)}
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {formError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-xl border border-border px-5 py-2.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
