import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  MoreVertical,
  Building2,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'
import { adjustAdminDashboardCount } from '../../lib/adminDashboardCounts'
import {
  createCompany,
  deleteCompany,
  getApiErrorMessage,
  getCompanies,
  updateCompany,
} from '../../services/api'

const defaultCompanyForm = {
  name: '',
  email: '',
  plan: 'Starter',
  users: '',
  status: 'Active',
}

const mapCompanyToDisplay = (company) => ({
  id: company.id,
  name: company.name || 'Untitled Company',
  email: company.email || 'No email added',
  plan: company.plan || 'Starter',
  users: Number(company.users_count ?? company.users ?? 0),
  status: company.status || 'Active',
  joined: company.created_at || new Date().toISOString(),
})

export default function Companies() {
  const location = useLocation()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [formError, setFormError] = useState('')
  const [activeActionId, setActiveActionId] = useState(null)
  const [editingCompany, setEditingCompany] = useState(null)
  const [companyForm, setCompanyForm] = useState(defaultCompanyForm)

  const loadCompanies = async ({ showErrorToast = true } = {}) => {
    try {
      setIsLoadingCompanies(true)
      const response = await getCompanies()
      const rows = Array.isArray(response.data) ? response.data : []
      setCompanies(rows.map(mapCompanyToDisplay))
    } catch (error) {
      if (showErrorToast) {
        toast.error(getApiErrorMessage(error, 'Failed to load companies'))
      }
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  useEffect(() => {
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

  const resetCompanyForm = () => {
    setCompanyForm(defaultCompanyForm)
    setFormError('')
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setEditingCompany(null)
    resetCompanyForm()
  }

  const handleFormChange = (field, value) => {
    setCompanyForm((current) => ({ ...current, [field]: value }))
  }

  const openAddModal = () => {
    setEditingCompany(null)
    setActiveActionId(null)
    resetCompanyForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (company) => {
    setEditingCompany(company)
    setActiveActionId(null)
    setCompanyForm({
      name: company.name,
      email: company.email === 'No email added' ? '' : company.email,
      plan: company.plan,
      users: String(company.users),
      status: company.status,
    })
    setFormError('')
    setIsAddModalOpen(true)
  }

  const handleDeleteCompany = async (company) => {
    setActiveActionId(null)

    if (!window.confirm(`Delete ${company.name}? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteCompany(company.id)
      setCompanies((current) => current.filter((item) => item.id !== company.id))
      adjustAdminDashboardCount('companies', -1)
      toast.success('Company deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete company'))
    }
  }

  const handleCompanySubmit = async (event) => {
    event.preventDefault()

    const trimmedName = companyForm.name.trim()
    const trimmedEmail = companyForm.email.trim().toLowerCase()
    const users = Number(companyForm.users)

    if (!trimmedName || !trimmedEmail || companyForm.users === '') {
      setFormError('Company name, email, and user count are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Enter a valid company email address.')
      return
    }

    if (!Number.isInteger(users) || users < 0) {
      setFormError('User count must be a valid whole number.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      plan: companyForm.plan,
      users_count: users,
      status: companyForm.status,
    }

    try {
      if (editingCompany) {
        const response = await updateCompany(editingCompany.id, payload)
        const updatedCompany = mapCompanyToDisplay(response.data)

        setCompanies((current) =>
          current.map((company) => (company.id === editingCompany.id ? updatedCompany : company))
        )
        toast.success('Company updated successfully')
        closeAddModal()
        return
      }

      const response = await createCompany(payload)
      const createdCompany = mapCompanyToDisplay(response.data)
      setCompanies((current) => [createdCompany, ...current])
      adjustAdminDashboardCount('companies', 1)
      toast.success('Company added successfully')
      closeAddModal()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to save company')
      setFormError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success/10 text-success'
      case 'trial':
        return 'bg-warning/10 text-warning'
      case 'suspended':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-primary/10 text-primary'
      case 'professional':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Companies</h2>
          <p className="text-muted-foreground">Manage registered companies on the platform</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-border bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoadingCompanies ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No companies found yet.</p>
            <p className="mt-2 text-xs text-muted-foreground">Add your first company to start building the admin directory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Users</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPlanColor(company.plan)}`}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{company.users}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(company.status)}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{new Date(company.joined).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={() => setActiveActionId(activeActionId === company.id ? null : company.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-muted"
                          aria-label={`Actions for ${company.name}`}
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {activeActionId === company.id && (
                          <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => openEditModal(company)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(company)}
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
            Showing {filteredCompanies.length} of {companies.length} companies
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
                <h3 className="text-xl font-semibold">{editingCompany ? 'Edit Company' : 'Add Company'}</h3>
                <p className="text-sm text-muted-foreground">
                  {editingCompany ? 'Update this company entry' : 'Create a new company entry'}
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

            <form onSubmit={handleCompanySubmit} className="space-y-5 px-6 py-5">
              <div>
                <label htmlFor="company-name" className="mb-2 block text-sm font-medium">
                  Company Name *
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyForm.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  placeholder="Northwind Logistics"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="company-email" className="mb-2 block text-sm font-medium">
                  Company Email *
                </label>
                <input
                  id="company-email"
                  type="email"
                  value={companyForm.email}
                  onChange={(event) => handleFormChange('email', event.target.value)}
                  placeholder="ops@northwind.com"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="company-plan" className="mb-2 block text-sm font-medium">
                    Plan
                  </label>
                  <select
                    id="company-plan"
                    value={companyForm.plan}
                    onChange={(event) => handleFormChange('plan', event.target.value)}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="company-users" className="mb-2 block text-sm font-medium">
                    User Count *
                  </label>
                  <input
                    id="company-users"
                    type="number"
                    min="0"
                    step="1"
                    value={companyForm.users}
                    onChange={(event) => handleFormChange('users', event.target.value)}
                    placeholder="12"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company-status" className="mb-2 block text-sm font-medium">
                  Status
                </label>
                <select
                  id="company-status"
                  value={companyForm.status}
                  onChange={(event) => handleFormChange('status', event.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Suspended">Suspended</option>
                </select>
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
                  {isSubmitting ? 'Saving...' : editingCompany ? 'Save Changes' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
