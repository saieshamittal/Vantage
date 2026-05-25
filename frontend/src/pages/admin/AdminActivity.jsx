import { useState } from 'react'
import { Search, Filter, User, Building2, CreditCard, Settings, Shield, LogIn, UserPlus, FileText, ChevronDown } from 'lucide-react'

const activityLog = [
  { id: 1, action: 'User Login', user: 'John Smith', company: 'Acme Corp', type: 'auth', time: '2 minutes ago', details: 'Successful login from 192.168.1.1', icon: LogIn },
  { id: 2, action: 'New User Registered', user: 'Emily Chen', company: 'TechStart', type: 'user', time: '15 minutes ago', details: 'Account created via invitation', icon: UserPlus },
  { id: 3, action: 'Subscription Upgraded', user: 'Sarah Johnson', company: 'Global Trade', type: 'billing', time: '32 minutes ago', details: 'Upgraded from Professional to Enterprise', icon: CreditCard },
  { id: 4, action: 'Report Generated', user: 'Michael Brown', company: 'Innovation Labs', type: 'report', time: '45 minutes ago', details: 'Q1 2024 Analytics Report', icon: FileText },
  { id: 5, action: 'Settings Updated', user: 'Chris Wilson', company: 'DataFlow', type: 'settings', time: '1 hour ago', details: 'Updated notification preferences', icon: Settings },
  { id: 6, action: 'Password Reset', user: 'Amanda Lee', company: 'CloudNine', type: 'security', time: '1.5 hours ago', details: 'Password successfully changed', icon: Shield },
  { id: 7, action: 'Company Created', user: 'David Park', company: 'NextGen Ventures', type: 'company', time: '2 hours ago', details: 'New company account registered', icon: Building2 },
  { id: 8, action: 'User Deactivated', user: 'Lisa Anderson', company: 'Quantum', type: 'user', time: '3 hours ago', details: 'Account suspended for policy violation', icon: User },
  { id: 9, action: 'API Key Generated', user: 'Robert Taylor', company: 'Acme Corp', type: 'security', time: '4 hours ago', details: 'New production API key created', icon: Shield },
  { id: 10, action: 'User Login', user: 'Jennifer White', company: 'TechStart', type: 'auth', time: '5 hours ago', details: 'Successful login from mobile app', icon: LogIn },
]

export default function AdminActivity() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredActivity = activityLog.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeColor = (type) => {
    switch (type) {
      case 'auth': return 'bg-primary/10 text-primary'
      case 'user': return 'bg-accent/10 text-accent'
      case 'billing': return 'bg-success/10 text-success'
      case 'security': return 'bg-warning/10 text-warning'
      case 'settings': return 'bg-muted text-muted-foreground'
      case 'company': return 'bg-primary/10 text-primary'
      case 'report': return 'bg-accent/10 text-accent'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <p className="text-muted-foreground">Track all platform activities and events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-input py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="auth">Authentication</option>
              <option value="user">User</option>
              <option value="billing">Billing</option>
              <option value="security">Security</option>
              <option value="settings">Settings</option>
              <option value="company">Company</option>
              <option value="report">Report</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="space-y-6">
          {filteredActivity.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < filteredActivity.length - 1 && (
                  <div className="absolute left-5 top-12 w-0.5 h-full bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${getTypeColor(activity.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{activity.action}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.user} • {activity.company}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 bg-muted/50 px-3 py-2 rounded-lg">
                      {activity.details}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredActivity.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activity found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
