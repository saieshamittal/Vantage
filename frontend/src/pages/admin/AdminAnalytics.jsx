import { TrendingUp, TrendingDown, Users, Building2, Activity, DollarSign } from 'lucide-react'
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

const revenueData = [
  { name: 'Jan', revenue: 42000, users: 1200 },
  { name: 'Feb', revenue: 48000, users: 1400 },
  { name: 'Mar', revenue: 55000, users: 1800 },
  { name: 'Apr', revenue: 52000, users: 2100 },
  { name: 'May', revenue: 68000, users: 2400 },
  { name: 'Jun', revenue: 72000, users: 2800 },
  { name: 'Jul', revenue: 85000, users: 3200 },
]

const planDistribution = [
  { name: 'Enterprise', value: 35, color: '#00d4c8' },
  { name: 'Professional', value: 45, color: '#00b4a8' },
  { name: 'Starter', value: 20, color: '#009488' },
]

const regionData = [
  { name: 'North America', companies: 42, users: 1580 },
  { name: 'Europe', companies: 28, users: 920 },
  { name: 'Asia Pacific', companies: 15, users: 480 },
  { name: 'Latin America', companies: 4, users: 220 },
]

const apiUsageData = [
  { name: 'Mon', calls: 125000 },
  { name: 'Tue', calls: 142000 },
  { name: 'Wed', calls: 168000 },
  { name: 'Thu', calls: 155000 },
  { name: 'Fri', calls: 148000 },
  { name: 'Sat', calls: 85000 },
  { name: 'Sun', calls: 72000 },
]

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

export default function AdminAnalytics() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Platform Analytics</h2>
        <p className="text-muted-foreground">Comprehensive platform metrics and insights</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Monthly Revenue" value="85,000" change={18.2} icon={DollarSign} prefix="$" />
        <MetricCard title="Total Users" value="3,245" change={12.5} icon={Users} />
        <MetricCard title="Total Companies" value="89" change={8.3} icon={Building2} />
        <MetricCard title="API Calls (7d)" value="895K" change={5.7} icon={Activity} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue over time</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00d4c8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Subscription Plans</h3>
            <p className="text-sm text-muted-foreground">Distribution by plan type</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#12121a', 
                    border: '1px solid #2a2a3a',
                    borderRadius: '12px',
                    color: '#f5f5f7'
                  }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                <span className="text-sm text-muted-foreground">{plan.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Regional distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Regional Distribution</h3>
            <p className="text-sm text-muted-foreground">Companies and users by region</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#12121a', 
                    border: '1px solid #2a2a3a',
                    borderRadius: '12px',
                    color: '#f5f5f7'
                  }}
                />
                <Bar dataKey="companies" fill="#00d4c8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Usage */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">API Usage</h3>
            <p className="text-sm text-muted-foreground">Daily API calls this week</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#12121a', 
                    border: '1px solid #2a2a3a',
                    borderRadius: '12px',
                    color: '#f5f5f7'
                  }}
                  formatter={(value) => [value.toLocaleString(), 'API Calls']}
                />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#00d4c8" 
                  strokeWidth={2}
                  dot={{ fill: '#00d4c8', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
