import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useAuth from '../../hooks/useAuth'
import { getApiErrorMessage, getProfile, updateProfile } from '../../services/api'
import { User, Mail, Building2, Phone, MapPin, Globe, Bell, Shield, Save, Camera } from 'lucide-react'

const defaultNotificationSettings = {
  orderUpdates: true,
  lowStockAlerts: true,
  paymentNotifications: true,
  weeklySummary: true,
  marketingEmails: false,
}

const defaultProfileFields = {
  name: '',
  email: '',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  company: 'Client Company',
  website: 'https://example.com',
  address: '123 Business Street, Suite 100\nSan Francisco, CA 94102',
}

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileForm, setProfileForm] = useState(defaultProfileFields)
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const response = await getProfile()
        const profileUser = response.data?.user || user

        setProfileForm({
          name: profileUser?.name || '',
          email: profileUser?.email || '',
          phone: profileUser?.phone || defaultProfileFields.phone,
          location: profileUser?.location || defaultProfileFields.location,
          company: profileUser?.company || defaultProfileFields.company,
          website: profileUser?.website || defaultProfileFields.website,
          address: profileUser?.address || defaultProfileFields.address,
        })

        setNotificationSettings({
          orderUpdates: profileUser?.notificationSettings?.orderUpdates ?? defaultNotificationSettings.orderUpdates,
          lowStockAlerts: profileUser?.notificationSettings?.lowStockAlerts ?? defaultNotificationSettings.lowStockAlerts,
          paymentNotifications: profileUser?.notificationSettings?.paymentNotifications ?? defaultNotificationSettings.paymentNotifications,
          weeklySummary: profileUser?.notificationSettings?.weeklySummary ?? defaultNotificationSettings.weeklySummary,
          marketingEmails: profileUser?.notificationSettings?.marketingEmails ?? defaultNotificationSettings.marketingEmails,
        })
      } catch (error) {
        setProfileForm({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || defaultProfileFields.phone,
          location: user?.location || defaultProfileFields.location,
          company: user?.company || defaultProfileFields.company,
          website: user?.website || defaultProfileFields.website,
          address: user?.address || defaultProfileFields.address,
        })

        setNotificationSettings({
          orderUpdates: user?.notificationSettings?.orderUpdates ?? defaultNotificationSettings.orderUpdates,
          lowStockAlerts: user?.notificationSettings?.lowStockAlerts ?? defaultNotificationSettings.lowStockAlerts,
          paymentNotifications: user?.notificationSettings?.paymentNotifications ?? defaultNotificationSettings.paymentNotifications,
          weeklySummary: user?.notificationSettings?.weeklySummary ?? defaultNotificationSettings.weeklySummary,
          marketingEmails: user?.notificationSettings?.marketingEmails ?? defaultNotificationSettings.marketingEmails,
        })

        toast.error(getApiErrorMessage(error, 'Failed to load profile'))
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user?.id])

  const handleFieldChange = (field, value) => {
    setProfileForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleNotificationToggle = (field) => {
    setNotificationSettings((currentSettings) => ({
      ...currentSettings,
      [field]: !currentSettings[field],
    }))
  }

  const handleSaveChanges = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Name and email are required.')
      return
    }

    setIsSaving(true)
    try {
      const response = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        location: profileForm.location.trim(),
        company: profileForm.company.trim(),
        website: profileForm.website.trim(),
        address: profileForm.address.trim(),
        notificationSettings,
      })

      const updatedUser = response.data?.user
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('auth-updated'))
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save profile'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">Manage your account and company information</p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {user?.avatar || profileForm.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-accent transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{profileForm.name}</h3>
            <p className="text-muted-foreground">{profileForm.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
                {user?.role}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {profileForm.company || 'Client Company'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'company', label: 'Company', icon: Building2 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-[2px] transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading profile...</div>
        ) : (
          <>
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => handleFieldChange('email', event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(event) => handleFieldChange('phone', event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(event) => handleFieldChange('location', event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(event) => handleFieldChange('company', event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(event) => handleFieldChange('website', event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    value={profileForm.address}
                    onChange={(event) => handleFieldChange('address', event.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'orderUpdates', label: 'Order updates', desc: 'Get notified when orders are placed, shipped, or delivered' },
                { key: 'lowStockAlerts', label: 'Low stock alerts', desc: 'Receive alerts when products are running low' },
                { key: 'paymentNotifications', label: 'Payment notifications', desc: 'Get notified about payments and refunds' },
                { key: 'weeklySummary', label: 'Weekly summary', desc: 'Receive a weekly summary of your business performance' },
                { key: 'marketingEmails', label: 'Marketing emails', desc: 'Tips, product updates, and promotional offers' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings[item.key]}
                      onChange={() => handleNotificationToggle(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Change Password</p>
                  <button className="text-primary text-sm hover:underline">Update</button>
                </div>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Two-Factor Authentication</p>
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">Disabled</span>
                </div>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                <button className="mt-3 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-accent transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Active Sessions</p>
                  <button className="text-primary text-sm hover:underline">Manage</button>
                </div>
                <p className="text-sm text-muted-foreground">You are logged in on 2 devices</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
