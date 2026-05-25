import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Server
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
  ADMIN_DASHBOARD_COUNTS_UPDATED_EVENT,
  getAdminDashboardCounts,
} from '../../lib/adminDashboardCounts'

const platformData = [
  { name: 'Jan', users: 1200, companies: 45 },
  { name: 'Feb', users: 1400, companies: 52 },
  { name: 'Mar', users: 1800, companies: 61 },
  { name: 'Apr', users: 2100, companies: 68 },
  { name: 'May', users: 2400, companies: 75 },
  { name: 'Jun', users: 2800, companies: 82 },
  { name: 'Jul', users: 3200, companies: 89 },
]

const activityData = [
  { name: 'Mon', logins: 420, actions: 1200 },
  { name: 'Tue', logins: 380, actions: 1100 },
  { name: 'Wed', logins: 510, actions: 1450 },
  { name: 'Thu', logins: 470, actions: 1300 },
  { name: 'Fri', logins: 390, actions: 1150 },
  { name: 'Sat', logins: 180, actions: 520 },
  { name: 'Sun', logins: 150, actions: 480 },
]

const recentActivity = [
  { id: 1, action: 'New company registered', company: 'Acme Corp', time: '5 minutes ago' },
  { id: 2, action: 'User subscription upgraded', company: 'TechStart Inc', time: '12 minutes ago' },
  { id: 3, action: 'Support ticket resolved', company: 'Global Trade', time: '28 minutes ago' },
  { id: 4, action: 'New user joined', company: 'Innovation Labs', time: '45 minutes ago' },
  { id: 5, action: 'Payment processed', company: 'DataFlow Systems', time: '1 hour ago' },
]

const systemAlerts = [
  { id: 1, type: 'warning', message: 'High API usage detected', time: '10 min ago' },
  { id: 2, type: 'info', message: 'Scheduled maintenance tonight', time: '2 hours ago' },
  { id: 3, type: 'success', message: 'Database backup completed', time: '4 hours ago' },
]

function StatCard({ title, value, change, icon: Icon, iconBg }) {
  const isPositive = change >= 0
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [dashboardCounts, setDashboardCounts] = useState(getAdminDashboardCounts)

  useEffect(() => {
    const refreshDashboardCounts = () => {
      setDashboardCounts(getAdminDashboardCounts())
    }

    window.addEventListener(ADMIN_DASHBOARD_COUNTS_UPDATED_EVENT, refreshDashboardCounts)
    window.addEventListener('storage', refreshDashboardCounts)

    return () => {
      window.removeEventListener(ADMIN_DASHBOARD_COUNTS_UPDATED_EVENT, refreshDashboardCounts)
      window.removeEventListener('storage', refreshDashboardCounts)
    }
  }, [])

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20">
        <h2 className="text-2xl font-bold mb-2">
          Platform Overview
        </h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here&apos;s your platform status at a glance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Companies" value={dashboardCounts.companies.toLocaleString()} change={8.2} icon={Building2} iconBg="bg-primary/10" />
        <StatCard title="Active Users" value={dashboardCounts.users.toLocaleString()} change={12.5} icon={Users} iconBg="bg-primary/10" />
        <StatCard title="System Uptime" value="99.9%" change={0.1} icon={Server} iconBg="bg-success/10" />
        <StatCard title="Active Alerts" value="3" change={-25} icon={AlertTriangle} iconBg="bg-warning/10" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Platform growth chart */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Platform Growth</h3>
              <p className="text-sm text-muted-foreground">Users and companies over time</p>
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp className="w-4 h-4" />
              +24% this quarter
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4c8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4c8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#00d4c8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity chart */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Weekly Activity</h3>
              <p className="text-sm text-muted-foreground">Logins and user actions</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
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
                <Bar dataKey="logins" fill="#00d4c8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actions" fill="#00b4a8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Logins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Actions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest platform events</p>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.company}</p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System alerts */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">System Alerts</h3>
            <p className="text-sm text-muted-foreground">Active notifications</p>
          </div>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl ${
                alert.type === 'warning' ? 'bg-warning/10' :
                alert.type === 'success' ? 'bg-success/10' : 'bg-muted'
              }`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  alert.type === 'warning' ? 'text-warning' :
                  alert.type === 'success' ? 'text-success' : 'text-primary'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
