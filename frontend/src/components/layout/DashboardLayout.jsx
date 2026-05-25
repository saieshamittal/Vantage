import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { getAlerts } from '../../services/api'
import { mapStockAlertsResponse } from '../../lib/stockAlerts'
import BrandLogo from './BrandLogo'
import SiteFooter from './SiteFooter'
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Building2,
  Users,
  Activity,
  AlertTriangle,
  Package,
  ShoppingCart,
  User,
  CheckCircle,
  Info,
} from 'lucide-react'

// Admin navigation items
const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

// Client navigation items
const clientNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { label: 'Profile', href: '/profile', icon: User },
]

const clientAlertGroups = [
  {
    label: 'Inventory',
    items: [],
  },
  {
    label: 'Orders',
    items: [
      { id: 'client-3', type: 'success', title: 'Payment received', message: 'Order ORD-003 payment was confirmed successfully.', time: '4 hours ago', unread: false },
      { id: 'client-4', type: 'info', title: 'Shipment update', message: 'Order ORD-002 is out for delivery today.', time: '5 hours ago', unread: false },
    ],
  },
]

const adminAlertGroups = [
  {
    label: 'System',
    items: [
      { id: 'admin-1', type: 'critical', title: 'Database connection issues', message: 'Multiple connection timeouts were detected in the last hour.', time: '10 min ago', unread: true },
      { id: 'admin-2', type: 'info', title: 'Scheduled maintenance', message: 'Maintenance is planned for tonight with limited downtime.', time: '2 hours ago', unread: false },
    ],
  },
  {
    label: 'Platform',
    items: [
      { id: 'admin-3', type: 'warning', title: 'High API usage', message: 'Acme Corp is nearing its monthly API quota.', time: '25 min ago', unread: true },
      { id: 'admin-4', type: 'success', title: 'Backup completed', message: 'Daily database backup completed with no issues.', time: '4 hours ago', unread: false },
    ],
  },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [liveClientStockAlerts, setLiveClientStockAlerts] = useState([])
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const alertsRef = useRef(null)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? adminNavItems : clientNavItems
  const alertGroups = isAdmin
    ? adminAlertGroups
    : [
        {
          label: 'Inventory',
          items: [...liveClientStockAlerts, ...clientAlertGroups[0].items],
        },
        ...clientAlertGroups.slice(1),
      ]
  const unreadAlertCount = alertGroups.flatMap((group) => group.items).filter((item) => item.unread).length
  const searchItems = isAdmin
    ? [
        { id: 'company-acme', label: 'Acme Corporation', description: 'Company record', href: '/admin/companies', keywords: 'acme corporation enterprise active', state: { searchTerm: 'Acme Corporation' } },
        { id: 'company-techstart', label: 'TechStart Inc', description: 'Company record', href: '/admin/companies', keywords: 'techstart professional company', state: { searchTerm: 'TechStart Inc' } },
        { id: 'user-john', label: 'John Smith', description: 'Admin user', href: '/admin/users', keywords: 'john smith admin acme', state: { searchTerm: 'John Smith' } },
        { id: 'user-sarah', label: 'Sarah Johnson', description: 'Platform user', href: '/admin/users', keywords: 'sarah johnson techstart', state: { searchTerm: 'Sarah Johnson' } },
        { id: 'alert-api', label: 'High API Usage', description: 'Warning alert', href: '/admin/alerts', keywords: 'api usage warning alert', state: { searchTerm: 'High API Usage' } },
        { id: 'alert-db', label: 'Database Connection Issues', description: 'Critical alert', href: '/admin/alerts', keywords: 'database connection critical alert', state: { searchTerm: 'Database Connection Issues' } },
      ]
    : [
        { id: 'product-widget', label: 'Widget Pro', description: 'Inventory item', href: '/inventory', keywords: 'widget pro stock inventory', state: { searchTerm: 'Widget Pro' } },
        { id: 'product-gadget', label: 'Gadget Plus', description: 'Low stock item', href: '/inventory', keywords: 'gadget plus low stock inventory', state: { searchTerm: 'Gadget Plus' } },
        { id: 'product-accessory', label: 'Accessory Pack', description: 'Out of stock item', href: '/inventory', keywords: 'accessory pack out of stock inventory', state: { searchTerm: 'Accessory Pack' } },
        { id: 'order-001', label: 'ORD-001', description: 'Delivered order', href: '/orders', keywords: 'ord-001 john smith delivered', state: { searchTerm: 'ORD-001' } },
        { id: 'order-003', label: 'ORD-003', description: 'Processing order', href: '/orders', keywords: 'ord-003 mike brown processing', state: { searchTerm: 'ORD-003' } },
        { id: 'alert-lowstock', label: 'Low Stock Alert', description: 'Inventory warning', href: '/alerts', keywords: 'low stock alert warning', state: { searchTerm: 'Low Stock Alert' } },
      ]

  const currentPage = navItems.find(item => item.href === location.pathname)?.label || 'Dashboard'
  const filteredSearchItems = searchItems.filter((item) => {
    if (!searchTerm.trim()) return true
    const query = searchTerm.trim().toLowerCase()
    return item.label.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.keywords.includes(query)
  }).slice(0, 6)

  useEffect(() => {
    if (isAdmin) {
      return
    }

    const loadLiveClientStockAlerts = async () => {
      try {
        const response = await getAlerts()
        setLiveClientStockAlerts(mapStockAlertsResponse(response.data).map((alert) => ({
          ...alert,
          time: 'Just now',
        })))
      } catch {
        setLiveClientStockAlerts([])
      }
    }

    loadLiveClientStockAlerts()

    const handleInventoryUpdated = () => {
      loadLiveClientStockAlerts()
    }

    window.addEventListener('inventory-updated', handleInventoryUpdated)

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdated)
    }
  }, [isAdmin])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setAlertsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAlertsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setSearchTerm('')
  }, [location.pathname])

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
      case 'warning':
        return AlertTriangle
      case 'success':
        return CheckCircle
      case 'info':
        return Info
      default:
        return Bell
    }
  }

  const getAlertTone = (type) => {
    switch (type) {
      case 'critical':
        return 'text-destructive bg-destructive/10 border-destructive/20'
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/20'
      case 'success':
        return 'text-success bg-success/10 border-success/20'
      case 'info':
        return 'text-primary bg-primary/10 border-primary/20'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  const handleQuickLogout = () => {
    setProfileOpen(false)
    logout()
    navigate('/')
  }

  const profilePrimaryLink = isAdmin ? '/admin/settings' : '/profile'
  const profilePrimaryLabel = isAdmin ? 'Open settings' : 'Open profile'

  const handleSearchSelect = (item) => {
    setSearchOpen(false)
    setSearchTerm('')
    navigate(item.href, item.state ? { state: item.state } : undefined)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    if (filteredSearchItems.length > 0) {
      handleSearchSelect(filteredSearchItems[0])
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-2 flex items-center justify-between">
            <BrandLogo logoClassName="h-20 w-auto" />
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-6 pb-4">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
              isAdmin 
                ? "bg-primary/20 text-primary" 
                : "bg-accent/20 text-accent"
            )}>
              {isAdmin ? 'Admin Portal' : 'Client Portal'}
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {user?.avatar || user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">{currentPage}</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name?.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setSearchOpen(true)
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder={isAdmin ? 'Search companies, users, alerts...' : 'Search products, orders, alerts...'}
                    className="bg-transparent border-none outline-none text-sm w-56 placeholder:text-muted-foreground"
                  />
                </form>

                {searchOpen && (
                  <div className="absolute right-0 top-12 z-40 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/50">Quick Search</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                      {filteredSearchItems.length > 0 ? (
                        filteredSearchItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSearchSelect(item)}
                            className="w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
                          >
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center">
                          <p className="text-sm text-muted-foreground">No matches found for "{searchTerm}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={alertsRef}>
                <button
                  type="button"
                  onClick={() => setAlertsOpen((current) => !current)}
                  className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  aria-label="Open alerts"
                >
                  <Bell className="w-5 h-5" />
                  {unreadAlertCount > 0 && (
                    <>
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                      <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {unreadAlertCount}
                      </span>
                    </>
                  )}
                </button>

                {alertsOpen && (
                  <div className="absolute right-0 top-12 z-40 w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-card/90 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-xs text-muted-foreground">
                          {unreadAlertCount > 0 ? `${unreadAlertCount} unread updates` : 'Everything is up to date'}
                        </p>
                      </div>
                      <Link
                        to={isAdmin ? '/admin/alerts' : '/alerts'}
                        onClick={() => setAlertsOpen(false)}
                        className="text-sm text-primary hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto p-3">
                      {alertGroups.map((group, groupIndex) => (
                        <div key={group.label}>
                          {groupIndex > 0 && <div className="my-3 h-px bg-white/10" />}
                          <div className="mb-2 px-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                              {group.label}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {group.items.map((alert) => {
                              const Icon = getAlertIcon(alert.type)
                              return (
                                <div
                                  key={alert.id}
                                  className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 transition-colors hover:bg-white/[0.05]"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={cn('mt-0.5 rounded-lg border p-2', getAlertTone(alert.type))}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{alert.title}</p>
                                            {alert.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                                          </div>
                                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            {alert.message}
                                          </p>
                                        </div>
                                        <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                                          {alert.time}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/30 transition-colors"
                  aria-label="Open profile menu"
                >
                  {user?.avatar || user?.name?.charAt(0) || 'U'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {user?.avatar || user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{user?.name || 'User'}</p>
                          <p className="truncate text-sm text-muted-foreground">{user?.email || 'No email available'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Role</p>
                          <p className="mt-1 text-sm font-medium capitalize">{user?.role || 'client'}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Portal</p>
                          <p className="mt-1 text-sm font-medium">{isAdmin ? 'Admin' : 'Client'}</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Account</p>
                        <p className="mt-1 text-sm font-medium">
                          {isAdmin ? 'Platform management access' : 'Business workspace access'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 p-3">
                      <Link
                        to={profilePrimaryLink}
                        onClick={() => setProfileOpen(false)}
                        className="mb-2 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent transition-colors"
                      >
                        {profilePrimaryLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={handleQuickLogout}
                        className="flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
