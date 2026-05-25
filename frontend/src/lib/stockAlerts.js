import { AlertCircle, Package } from 'lucide-react'

export const mapStockAlertsResponse = (data) => {
  const alerts = Array.isArray(data?.alerts) ? data.alerts : []

  return alerts
    .filter((alert) => alert.type === 'low_stock' || alert.type === 'out_of_stock')
    .map((alert) => ({
      id: `live-${alert.type}-${alert.product_id}`,
      type: alert.severity,
      title: alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock Alert',
      message: alert.message,
      time: 'Just now',
      read: false,
      unread: true,
      icon: alert.type === 'out_of_stock' ? AlertCircle : Package,
    }))
}
