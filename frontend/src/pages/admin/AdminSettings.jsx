import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { User, Bell, Shield, Palette, Globe, Database, Mail, Save } from 'lucide-react'

export default function AdminSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage platform settings and configurations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform Name</label>
                    <input
                      type="text"
                      defaultValue="Vantage"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Support Email</label>
                    <input
                      type="email"
                      defaultValue="support@vantage.com"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Timezone</label>
                    <select className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'New company registrations', desc: 'Get notified when new companies sign up' },
                    { label: 'Payment alerts', desc: 'Receive alerts for failed or successful payments' },
                    { label: 'Security alerts', desc: 'Critical security notifications' },
                    { label: 'System updates', desc: 'Platform updates and maintenance notices' },
                    { label: 'Weekly reports', desc: 'Automated weekly summary reports' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Enabled</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Session Timeout</p>
                      <select className="px-3 py-1 bg-input border border-border rounded-lg text-sm">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                        <option>8 hours</option>
                      </select>
                    </div>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">IP Whitelist</p>
                      <button className="text-primary text-sm hover:underline">Configure</button>
                    </div>
                    <p className="text-sm text-muted-foreground">Restrict admin access to specific IP addresses</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 rounded-xl border-2 border-primary bg-muted flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-background border border-border" />
                        <span className="text-sm">Dark</span>
                      </button>
                      <button className="p-4 rounded-xl border border-border bg-muted flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-border" />
                        <span className="text-sm">Light</span>
                      </button>
                      <button className="p-4 rounded-xl border border-border bg-muted flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-background to-white border border-border" />
                        <span className="text-sm">System</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" defaultValue="#00d4c8" className="w-12 h-12 rounded-lg cursor-pointer" />
                      <input
                        type="text"
                        defaultValue="#00d4c8"
                        className="flex-1 px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Host</label>
                    <input
                      type="text"
                      defaultValue="smtp.sendgrid.net"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">SMTP Port</label>
                      <input
                        type="text"
                        defaultValue="587"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Encryption</label>
                      <select className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>TLS</option>
                        <option>SSL</option>
                        <option>None</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">From Email</label>
                    <input
                      type="email"
                      defaultValue="noreply@vantage.com"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Database Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Database Status</p>
                      <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">Connected</span>
                    </div>
                    <p className="text-sm text-muted-foreground">PostgreSQL 15.2 | us-east-1</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Last Backup</p>
                      <span className="text-sm text-muted-foreground">4 hours ago</span>
                    </div>
                    <button className="text-primary text-sm hover:underline">Trigger Manual Backup</button>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Storage Used</p>
                      <span className="text-sm text-muted-foreground">24.5 GB / 100 GB</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '24.5%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6 pt-6 border-t border-border">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent transition-colors">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
