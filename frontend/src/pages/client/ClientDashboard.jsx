import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Clock
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  CLIENT_DASHBOARD_COUNTS_UPDATED_EVENT,
  getClientDashboardCounts,
} from '../../lib/clientDashboardCounts'

const salesData = [
  { name: 'Jan', sales: 12000 },
  { name: 'Feb', sales: 15000 },
  { name: 'Mar', sales: 18000 },
  { name: 'Apr', sales: 16000 },
  { name: 'May', sales: 21000 },
  { name: 'Jun', sales: 24000 },
  { name: 'Jul', sales: 28000 },
]

const ordersByDay = [
  { name: 'Mon', orders: 45 },
  { name: 'Tue', orders: 52 },
  { name: 'Wed', orders: 38 },
  { name: 'Thu', orders: 65 },
  { name: 'Fri', orders: 71 },
  { name: 'Sat', orders: 29 },
  { name: 'Sun', orders: 18 },
]

const recentOrders = [
  { id: 'ORD-001', customer: 'John Smith', product: 'Widget Pro', amount: '$249.00', status: 'Delivered', time: '2 hours ago' },
  { id: 'ORD-002', customer: 'Sarah Lee', product: 'Gadget Plus', amount: '$189.00', status: 'Shipped', time: '4 hours ago' },
  { id: 'ORD-003', customer: 'Mike Brown', product: 'Tool Set', amount: '$345.00', status: 'Processing', time: '6 hours ago' },
  { id: 'ORD-004', customer: 'Emily Davis', product: 'Widget Basic', amount: '$99.00', status: 'Pending', time: '8 hours ago' },
]

const lowStockItems = [
  { name: 'Widget Pro', sku: 'WGT-001', category: 'Widgets', stock: 5, threshold: 10, price: 249.00 },
  { name: 'Gadget Plus', sku: 'GDG-001', category: 'Gadgets', stock: 3, threshold: 15, price: 189.00 },
  { name: 'Tool Set', sku: 'TLS-001', category: 'Tools', stock: 8, threshold: 20, price: 345.00 },
]

function StatCard({ title, value, change, icon: Icon, prefix = '' }) {
  const isPositive = change >= 0
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{prefix}{value}</h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </div>
  )
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardCounts, setDashboardCounts] = useState(getClientDashboardCounts)

  useEffect(() => {
    const refreshDashboardCounts = () => {
      setDashboardCounts(getClientDashboardCounts())
    }

    window.addEventListener(CLIENT_DASHBOARD_COUNTS_UPDATED_EVENT, refreshDashboardCounts)
    window.addEventListener('storage', refreshDashboardCounts)

    return () => {
      window.removeEventListener(CLIENT_DASHBOARD_COUNTS_UPDATED_EVENT, refreshDashboardCounts)
      window.removeEventListener('storage', refreshDashboardCounts)
    }
  }, [])

  const handleReorder = (item) => {
    navigate('/inventory', {
      state: {
        reorderProduct: {
          name: item.name,
          sku: item.sku,
          category: item.category,
          price: item.price,
          stock: item.threshold,
          currentStock: item.stock,
          threshold: item.threshold,
        },
      },
    })
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-success/10 text-success'
      case 'shipped': return 'bg-primary/10 text-primary'
      case 'processing': return 'bg-warning/10 text-warning'
      case 'pending': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20">
        <h2 className="text-2xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s your business overview for today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={dashboardCounts.revenue.toLocaleString()} change={15.3} icon={DollarSign} prefix="$" />
        <StatCard title="Total Orders" value={dashboardCounts.orders.toLocaleString()} change={8.7} icon={ShoppingCart} />
        <StatCard title="Products in Stock" value={dashboardCounts.productsInStock.toLocaleString()} change={-2.4} icon={Package} />
        <StatCard title="Pending Orders" value={dashboardCounts.pendingOrders.toLocaleString()} change={12.1} icon={Clock} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales chart */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Sales Overview</h3>
              <p className="text-sm text-muted-foreground">Monthly sales trend</p>
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +16.8% vs last month
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4c8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4c8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#12121a', 
                    border: '1px solid #2a2a3a',
                    borderRadius: '12px',
                    color: '#f5f5f7'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#00d4c8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by day chart */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Orders This Week</h3>
              <p className="text-sm text-muted-foreground">Daily order count</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#12121a', 
                    border: '1px solid #2a2a3a',
                    borderRadius: '12px',
                    color: '#f5f5f7'
                  }}
                />
                <Bar dataKey="orders" fill="#00d4c8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <p className="text-sm text-muted-foreground">Latest customer orders</p>
            </div>
            <Link to="/orders" className="text-primary text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer} • {order.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
              <p className="text-sm text-muted-foreground">Items below threshold</p>
            </div>
            <Link to="/inventory" className="text-primary text-sm hover:underline">Manage inventory</Link>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-warning/5 border border-warning/20">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.stock} units left (threshold: {item.threshold})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleReorder(item)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-accent transition-colors"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
