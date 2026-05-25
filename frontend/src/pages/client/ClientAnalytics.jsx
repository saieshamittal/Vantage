import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const salesTrendData = [
  { name: 'Jan', sales: 12000, orders: 85 },
  { name: 'Feb', sales: 15000, orders: 102 },
  { name: 'Mar', sales: 18000, orders: 124 },
  { name: 'Apr', sales: 16000, orders: 98 },
  { name: 'May', sales: 21000, orders: 143 },
  { name: 'Jun', sales: 24000, orders: 167 },
  { name: 'Jul', sales: 28000, orders: 189 },
]

const productPerformance = [
  { name: 'Widget Pro', sales: 12500 },
  { name: 'Gadget Plus', sales: 8900 },
  { name: 'Tool Set', sales: 7200 },
  { name: 'Widget Basic', sales: 5600 },
  { name: 'Accessory Pack', sales: 3200 },
]

const categoryBreakdown = [
  { name: 'Widgets', value: 45, color: '#00d4c8' },
  { name: 'Gadgets', value: 25, color: '#00b4a8' },
  { name: 'Tools', value: 20, color: '#009488' },
  { name: 'Accessories', value: 10, color: '#007468' },
]

const customerData = [
  { name: 'Mon', new: 12, returning: 28 },
  { name: 'Tue', new: 15, returning: 32 },
  { name: 'Wed', new: 8, returning: 25 },
  { name: 'Thu', new: 22, returning: 35 },
  { name: 'Fri', new: 18, returning: 42 },
  { name: 'Sat', new: 10, returning: 18 },
  { name: 'Sun', new: 6, returning: 12 },
]

const chartTooltipStyle = {
  backgroundColor: '#12121a',
  border: '1px solid #2a2a3a',
  borderRadius: '12px',
}

const chartTooltipLabelStyle = {
  color: '#f5f5f7',
}

const chartTooltipItemStyle = {
  color: '#f5f5f7',
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const category = payload[0].payload

  return (
    <div className="min-w-[190px] rounded-2xl border border-border bg-[#12121a]/95 px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
        <p className="text-sm font-medium text-foreground">{category.name}</p>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Share</span>
          <span className="font-medium text-foreground">{category.value}%</span>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Category</span>
          <span className="font-medium text-foreground">Sales distribution</span>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, icon: Icon, prefix = '' }) {
  const isPositive = change >= 0
  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold">{prefix}{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  )
}

export default function ClientAnalytics() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Track your business performance and insights</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Sales" value="28,450" change={15.3} icon={DollarSign} prefix="$" />
        <MetricCard title="Total Orders" value="318" change={8.7} icon={ShoppingCart} />
        <MetricCard title="Products Sold" value="1,892" change={12.4} icon={Package} />
        <MetricCard title="New Customers" value="91" change={22.1} icon={Users} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales trend */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Sales Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue over time</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorSalesTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4c8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4c8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#00d4c8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSalesTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Sales by Category</h3>
            <p className="text-sm text-muted-foreground">Revenue distribution</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CategoryTooltip />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-muted-foreground">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product performance */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Top Products</h3>
            <p className="text-sm text-muted-foreground">Best selling products by revenue</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#00d4c8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer analytics */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Customer Activity</h3>
            <p className="text-sm text-muted-foreground">New vs returning customers</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip 
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                />
                <Line type="monotone" dataKey="new" stroke="#00d4c8" strokeWidth={2.5} dot={{ fill: '#00d4c8', r: 4 }} />
                <Line type="monotone" dataKey="returning" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">New Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
              <span className="text-sm text-muted-foreground">Returning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
