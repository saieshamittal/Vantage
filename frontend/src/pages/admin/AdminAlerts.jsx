import { useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, Info, X, Bell, Filter, ChevronDown } from 'lucide-react'

const alertsData = [
  { id: 1, type: 'critical', title: 'Database Connection Issues', message: 'Multiple connection timeouts detected in the last hour. Investigating root cause.', time: '10 minutes ago', read: false },
  { id: 2, type: 'warning', title: 'High API Usage', message: 'API usage for Acme Corp has exceeded 90% of their monthly quota.', time: '25 minutes ago', read: false },
  { id: 3, type: 'warning', title: 'Payment Failed', message: 'Subscription renewal payment failed for TechStart Inc. Retry scheduled.', time: '1 hour ago', read: false },
  { id: 4, type: 'info', title: 'Scheduled Maintenance', message: 'System maintenance scheduled for tonight at 2:00 AM UTC. Expected downtime: 30 minutes.', time: '2 hours ago', read: true },
  { id: 5, type: 'success', title: 'Backup Completed', message: 'Daily database backup completed successfully. All systems operational.', time: '4 hours ago', read: true },
  { id: 6, type: 'info', title: 'New Feature Deployed', message: 'Advanced analytics dashboard v2.0 has been deployed to all enterprise customers.', time: '6 hours ago', read: true },
  { id: 7, type: 'warning', title: 'SSL Certificate Expiring', message: 'SSL certificate for api.vantage.com will expire in 14 days. Renewal recommended.', time: '8 hours ago', read: true },
  { id: 8, type: 'success', title: 'Security Scan Complete', message: 'Weekly security vulnerability scan completed. No critical issues found.', time: '12 hours ago', read: true },
]

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredAlerts = alerts.filter(alert => 
    typeFilter === 'all' || alert.type === typeFilter
  )

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return AlertCircle
      case 'warning': return AlertTriangle
      case 'success': return CheckCircle
      case 'info': return Info
      default: return Bell
    }
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical': return 'border-destructive/50 bg-destructive/5'
      case 'warning': return 'border-warning/50 bg-warning/5'
      case 'success': return 'border-success/50 bg-success/5'
      case 'info': return 'border-primary/50 bg-primary/5'
      default: return 'border-border bg-card'
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-destructive'
      case 'warning': return 'text-warning'
      case 'success': return 'text-success'
      case 'info': return 'text-primary'
      default: return 'text-muted-foreground'
    }
  }

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const markAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">System Alerts</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts read'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-input py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Critical</span>
          </div>
          <p className="text-2xl font-bold">{alerts.filter(a => a.type === 'critical').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-warning">Warning</span>
          </div>
          <p className="text-2xl font-bold">{alerts.filter(a => a.type === 'warning').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Info</span>
          </div>
          <p className="text-2xl font-bold">{alerts.filter(a => a.type === 'info').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">Success</span>
          </div>
          <p className="text-2xl font-bold">{alerts.filter(a => a.type === 'success').length}</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type)
          return (
            <div 
              key={alert.id} 
              className={`p-4 rounded-xl border ${getAlertStyles(alert.type)} ${!alert.read ? 'ring-2 ring-primary/20' : ''}`}
              onClick={() => markAsRead(alert.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${alert.type === 'critical' ? 'bg-destructive/10' : alert.type === 'warning' ? 'bg-warning/10' : alert.type === 'success' ? 'bg-success/10' : 'bg-primary/10'}`}>
                  <Icon className={`w-5 h-5 ${getIconColor(alert.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                      className="p-1 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts to display</p>
          </div>
        )}
      </div>
    </div>
  )
}
