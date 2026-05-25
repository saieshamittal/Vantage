import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, Info, X, Bell, Package, ShoppingCart, DollarSign, ChevronDown } from 'lucide-react'
import { getAlerts, getApiErrorMessage } from '../../services/api'
import { mapStockAlertsResponse } from '../../lib/stockAlerts'

const alertsData = [
  { id: 4, type: 'success', title: 'Order Delivered', message: 'Order ORD-001 has been successfully delivered to John Smith.', time: '2 hours ago', read: true, icon: ShoppingCart },
  { id: 5, type: 'info', title: 'New Order', message: 'You received a new order (ORD-009) from David Chen for $438.00.', time: '3 hours ago', read: true, icon: ShoppingCart },
  { id: 6, type: 'success', title: 'Payment Received', message: 'Payment of $892.00 for order ORD-003 has been confirmed.', time: '4 hours ago', read: true, icon: DollarSign },
  { id: 7, type: 'info', title: 'Shipment Update', message: 'Order ORD-002 is out for delivery. Expected arrival today.', time: '5 hours ago', read: true, icon: ShoppingCart },
  { id: 8, type: 'warning', title: 'Price Drop Recommendation', message: 'Widget Basic has been in stock for 30+ days. Consider running a promotion.', time: '1 day ago', read: true, icon: DollarSign },
]

export default function ClientAlerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const [liveStockAlerts, setLiveStockAlerts] = useState([])
  const [alertError, setAlertError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const loadLiveStockAlerts = async ({ showError = false } = {}) => {
    try {
      const response = await getAlerts()
      setLiveStockAlerts(mapStockAlertsResponse(response.data))
      setAlertError('')
    } catch (error) {
      if (showError) {
        setAlertError(getApiErrorMessage(error, 'Failed to load stock alerts'))
      }
    }
  }

  useEffect(() => {
    loadLiveStockAlerts()

    const handleInventoryUpdated = () => {
      loadLiveStockAlerts()
    }

    window.addEventListener('inventory-updated', handleInventoryUpdated)

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdated)
    }
  }, [])

  const mergedAlerts = useMemo(() => [...liveStockAlerts, ...alerts], [liveStockAlerts, alerts])

  const filteredAlerts = mergedAlerts.filter(alert => 
    typeFilter === 'all' || alert.type === typeFilter
  )

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
    if (id.toString().startsWith('live-')) {
      setLiveStockAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== id))
      return
    }

    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  const markAsRead = (id) => {
    if (id.toString().startsWith('live-')) {
      setLiveStockAlerts((currentAlerts) =>
        currentAlerts.map((alert) => (alert.id === id ? { ...alert, read: true, unread: false } : alert))
      )
      return
    }

    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })))
    setLiveStockAlerts((currentAlerts) => currentAlerts.map((alert) => ({ ...alert, read: true, unread: false })))
  }

  const unreadCount = mergedAlerts.filter(a => !a.read).length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Alerts</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts read'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
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

      {/* Alert Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Critical</span>
          </div>
          <p className="text-2xl font-bold">{mergedAlerts.filter(a => a.type === 'critical').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-warning">Warning</span>
          </div>
          <p className="text-2xl font-bold">{mergedAlerts.filter(a => a.type === 'warning').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Info</span>
          </div>
          <p className="text-2xl font-bold">{mergedAlerts.filter(a => a.type === 'info').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">Success</span>
          </div>
          <p className="text-2xl font-bold">{mergedAlerts.filter(a => a.type === 'success').length}</p>
        </div>
      </div>

      {alertError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {alertError}
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const Icon = alert.icon
          return (
            <div 
              key={alert.id} 
              className={`p-4 rounded-xl border ${getAlertStyles(alert.type)} ${!alert.read ? 'ring-2 ring-primary/20' : ''} cursor-pointer`}
              onClick={() => markAsRead(alert.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  alert.type === 'critical' ? 'bg-destructive/10' : 
                  alert.type === 'warning' ? 'bg-warning/10' : 
                  alert.type === 'success' ? 'bg-success/10' : 'bg-primary/10'
                }`}>
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
