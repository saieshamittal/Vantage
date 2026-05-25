import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Filter, ShoppingCart, MoreVertical, ChevronLeft, ChevronRight, Calendar, User, X, ChevronDown } from 'lucide-react'
import { adjustClientDashboardCounts } from '../../lib/clientDashboardCounts'

const ordersData = [
  { id: 'ORD-001', customer: 'John Smith', email: 'john@email.com', items: 3, total: 547.00, status: 'Delivered', date: '2024-03-15' },
  { id: 'ORD-002', customer: 'Sarah Lee', email: 'sarah@email.com', items: 1, total: 189.00, status: 'Shipped', date: '2024-03-14' },
  { id: 'ORD-003', customer: 'Mike Brown', email: 'mike@email.com', items: 5, total: 892.00, status: 'Processing', date: '2024-03-14' },
  { id: 'ORD-004', customer: 'Emily Davis', email: 'emily@email.com', items: 2, total: 298.00, status: 'Pending', date: '2024-03-13' },
  { id: 'ORD-005', customer: 'Chris Wilson', email: 'chris@email.com', items: 1, total: 99.00, status: 'Delivered', date: '2024-03-13' },
  { id: 'ORD-006', customer: 'Amanda Lee', email: 'amanda@email.com', items: 4, total: 756.00, status: 'Shipped', date: '2024-03-12' },
  { id: 'ORD-007', customer: 'David Chen', email: 'david@email.com', items: 2, total: 438.00, status: 'Cancelled', date: '2024-03-12' },
  { id: 'ORD-008', customer: 'Lisa Anderson', email: 'lisa@email.com', items: 1, total: 345.00, status: 'Refunded', date: '2024-03-11' },
]

const buildOrderWithUnitPrice = (order) => ({
  ...order,
  unitPrice: Number((order.total / order.items).toFixed(2)),
})

const calculateOrderTotal = (order) => Number((order.items * order.unitPrice).toFixed(2))

const countsRevenue = (order) => !['cancelled', 'refunded'].includes(order.status.toLowerCase())

const getOrderDashboardValues = (order) => ({
  revenue: countsRevenue(order) ? calculateOrderTotal(order) : 0,
  pendingOrders: order.status.toLowerCase() === 'pending' ? 1 : 0,
})

export default function Orders() {
  const location = useLocation()
  const navigate = useNavigate()
  const actionsRef = useRef(null)
  const modalRef = useRef(null)
  const [orders, setOrders] = useState(() => ordersData.map(buildOrderWithUnitPrice))
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeActionId, setActiveActionId] = useState(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [formError, setFormError] = useState('')
  const [orderForm, setOrderForm] = useState({
    customer: '',
    email: '',
    items: 1,
    unitPrice: '',
    status: 'Pending',
    date: '',
  })

  useEffect(() => {
    const searchPreset = location.state?.searchTerm

    if (!searchPreset) {
      return
    }

    setSearchTerm(searchPreset)
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setActiveActionId(null)
      }

      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeOrderModal()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveActionId(null)
        closeOrderModal()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-success/10 text-success'
      case 'shipped': return 'bg-primary/10 text-primary'
      case 'processing': return 'bg-warning/10 text-warning'
      case 'pending': return 'bg-muted text-muted-foreground'
      case 'cancelled': return 'bg-destructive/10 text-destructive'
      case 'refunded': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const totalRevenue = orders
    .filter(o => !['cancelled', 'refunded'].includes(o.status.toLowerCase()))
    .reduce((sum, o) => sum + calculateOrderTotal(o), 0)

  const resetOrderForm = () => {
    setOrderForm({
      customer: '',
      email: '',
      items: 1,
      unitPrice: '',
      status: 'Pending',
      date: '',
    })
    setFormError('')
  }

  const closeOrderModal = () => {
    setIsOrderModalOpen(false)
    setEditingOrderId(null)
    resetOrderForm()
  }

  const openEditModal = (order) => {
    setOrderForm({
      customer: order.customer,
      email: order.email,
      items: order.items,
      unitPrice: order.unitPrice.toString(),
      status: order.status,
      date: order.date,
    })
    setEditingOrderId(order.id)
    setFormError('')
    setIsOrderModalOpen(true)
    setActiveActionId(null)
  }

  const handleDeleteOrder = (orderId) => {
    const orderToDelete = orders.find((order) => order.id === orderId)

    if (!orderToDelete) {
      return
    }

    const confirmed = window.confirm(`Delete order ${orderToDelete.id}?`)

    if (!confirmed) {
      return
    }

    const deletedOrderValues = getOrderDashboardValues(orderToDelete)
    adjustClientDashboardCounts({
      revenue: -deletedOrderValues.revenue,
      orders: -1,
      pendingOrders: -deletedOrderValues.pendingOrders,
    })
    setOrders((currentOrders) => currentOrders.filter((order) => order.id !== orderId))
    setActiveActionId(null)
  }

  const handleOrderFormChange = (field, value) => {
    setOrderForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSaveOrder = (event) => {
    event.preventDefault()

    if (!editingOrderId) {
      return
    }

    if (!orderForm.customer || !orderForm.email || !orderForm.items || !orderForm.unitPrice || !orderForm.date) {
      setFormError('Please fill in all required order details.')
      return
    }

    const existingOrder = orders.find((order) => order.id === editingOrderId)

    if (!existingOrder) {
      setFormError('Order not found.')
      return
    }

    const updatedOrder = {
      ...existingOrder,
      customer: orderForm.customer.trim(),
      email: orderForm.email.trim(),
      items: Number(orderForm.items),
      unitPrice: Number(orderForm.unitPrice),
      total: Number((Number(orderForm.items) * Number(orderForm.unitPrice)).toFixed(2)),
      status: orderForm.status,
      date: orderForm.date,
    }
    const previousValues = getOrderDashboardValues(existingOrder)
    const nextValues = getOrderDashboardValues(updatedOrder)

    adjustClientDashboardCounts({
      revenue: nextValues.revenue - previousValues.revenue,
      pendingOrders: nextValues.pendingOrders - previousValues.pendingOrders,
    })

    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === editingOrderId ? updatedOrder : order))
    )

    closeOrderModal()
  }

  const handleExportOrders = () => {
    if (!filteredOrders.length) {
      window.alert('There are no orders to export for the current filters.')
      return
    }

    const headers = ['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date']
    const rows = filteredOrders.map((order) =>
      [
        order.id,
        order.customer,
        order.email,
        order.items,
        calculateOrderTotal(order).toFixed(2),
        order.status,
        order.date,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    )

    const csvContent = [headers.join(','), ...rows].join('\n')
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const downloadUrl = URL.createObjectURL(csvBlob)
    const downloadLink = document.createElement('a')
    const fileDate = new Date().toISOString().slice(0, 10)

    downloadLink.href = downloadUrl
    downloadLink.download = `vantage-orders-${fileDate}.csv`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <button
          type="button"
          onClick={handleExportOrders}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent transition-colors"
        >
          Export Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === 'Pending').length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === 'Delivered').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-input py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden" ref={actionsRef}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.items} items</td>
                  <td className="px-6 py-4 font-medium">${calculateOrderTotal(order).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => setActiveActionId(activeActionId === order.id ? null : order.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {activeActionId === order.id && (
                      <div className="absolute right-6 mt-2 w-40 rounded-xl border border-border bg-card shadow-lg z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => openEditModal(order)}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-muted/60 transition-colors"
                        >
                          Edit order
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="w-full px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Delete order
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">1</span>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h3 className="text-xl font-semibold">Edit Order</h3>
                <p className="text-sm text-muted-foreground">Update customer and fulfillment details for {editingOrderId}.</p>
              </div>
              <button
                type="button"
                onClick={closeOrderModal}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 space-y-5">
              {formError && (
                <div className="px-4 py-3 rounded-xl border border-destructive/20 bg-destructive/10 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name</label>
                  <input
                    type="text"
                    value={orderForm.customer}
                    onChange={(event) => handleOrderFormChange('customer', event.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={orderForm.email}
                    onChange={(event) => handleOrderFormChange('email', event.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Items</label>
                  <input
                    type="number"
                    min="1"
                    value={orderForm.items}
                    onChange={(event) => handleOrderFormChange('items', event.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Per Item</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderForm.unitPrice}
                    onChange={(event) => handleOrderFormChange('unitPrice', event.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={orderForm.status}
                    onChange={(event) => handleOrderFormChange('status', event.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Date</label>
                  <input
                    type="date"
                    value={orderForm.date}
                    onChange={(event) => handleOrderFormChange('date', event.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm text-muted-foreground">Calculated order total</p>
                <p className="text-lg font-semibold">
                  $
                  {(
                    (Number(orderForm.items) || 0) *
                    (Number(orderForm.unitPrice) || 0)
                  ).toFixed(2)}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
