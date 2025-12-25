'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Settings as SettingsIcon, Save, Globe, CreditCard, Users,
  Shield, Database, RefreshCw, AlertCircle, CheckCircle,
  DollarSign, Percent, Home, Link as LinkIcon
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    payoutMinAmount: { value: 100, group: 'payments', description: 'Minimum amount for withdrawal (₹)' },
    referralPercent: { value: 5, group: 'referral', description: 'Referral percentage (%)' },
    frontendUrl: { value: '', group: 'platform', description: 'Frontend URL' },
    backendUrl: { value: '', group: 'platform', description: 'Backend URL' },
    adminEmail: { value: '', group: 'platform', description: 'Admin Email' },
    supportEmail: { value: '', group: 'platform', description: 'Support Email' },
    taxPercentage: { value: 18, group: 'payments', description: 'Tax Percentage (%)' },
    maxWithdrawal: { value: 50000, group: 'payments', description: 'Maximum Withdrawal (₹)' },
    defaultCommission: { value: 15, group: 'referral', description: 'Default Commission (%)' },
  })

  const [additionalSettings, setAdditionalSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    autoApprovePayouts: false,
  })

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/settings`, {
          signal: controller.signal, 
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
        const data = await res.json()
        if (res.ok) {
          const items = data?.data?.items || []
          const next = { ...form }
          for (const it of items) {
            next[it.key] = { value: it.value, group: it.group, description: it.description }
          }
          setForm(next)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally { 
        setLoading(false) 
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const change = (key, val) => setForm(prev => ({ 
    ...prev, 
    [key]: { ...prev[key], value: val } 
  }))

  const toggleSetting = (key) => setAdditionalSettings(prev => ({
    ...prev,
    [key]: !prev[key]
  }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/settings`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save settings')
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const resetDefaults = () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      setForm({
        payoutMinAmount: { value: 100, group: 'payments', description: 'Minimum amount for withdrawal (₹)' },
        referralPercent: { value: 5, group: 'referral', description: 'Referral percentage (%)' },
        frontendUrl: { value: '', group: 'platform', description: 'Frontend URL' },
        backendUrl: { value: '', group: 'platform', description: 'Backend URL' },
        adminEmail: { value: '', group: 'platform', description: 'Admin Email' },
        supportEmail: { value: '', group: 'platform', description: 'Support Email' },
        taxPercentage: { value: 18, group: 'payments', description: 'Tax Percentage (%)' },
        maxWithdrawal: { value: 50000, group: 'payments', description: 'Maximum Withdrawal (₹)' },
        defaultCommission: { value: 15, group: 'referral', description: 'Default Commission (%)' },
      })
      toast.success('Settings reset to defaults')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage platform configuration and preferences</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Platform Settings */}
              <Section 
                title="Platform Configuration" 
                icon={<Globe className="w-5 h-5" />}
                description="Core platform URLs and email addresses"
              >
                <Field 
                  label="Frontend URL"
                  icon={<Home className="w-4 h-4 text-gray-400" />}
                  description="Your frontend application URL"
                >
                  <input 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    value={form.frontendUrl?.value || ''} 
                    onChange={(e) => change('frontendUrl', e.target.value)} 
                    placeholder="https://earnko.com"
                  />
                </Field>
                <Field 
                  label="Backend URL"
                  icon={<Database className="w-4 h-4 text-gray-400" />}
                  description="Your backend API URL"
                >
                  <input 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    value={form.backendUrl?.value || ''} 
                    onChange={(e) => change('backendUrl', e.target.value)} 
                    placeholder="https://api.earnko.com"
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="Admin Email"
                    icon={<SettingsIcon className="w-4 h-4 text-gray-400" />}
                  >
                    <input 
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.adminEmail?.value || ''} 
                      onChange={(e) => change('adminEmail', e.target.value)} 
                      placeholder="admin@earnko.com"
                    />
                  </Field>
                  <Field 
                    label="Support Email"
                    icon={<Users className="w-4 h-4 text-gray-400" />}
                  >
                    <input 
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.supportEmail?.value || ''} 
                      onChange={(e) => change('supportEmail', e.target.value)} 
                      placeholder="officialearnko@gmail.com"
                    />
                  </Field>
                </div>
              </Section>

              {/* Payment Settings */}
              <Section 
                title="Payment Settings" 
                icon={<CreditCard className="w-5 h-5" />}
                description="Withdrawal and payment configurations"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field 
                    label="Min. Withdrawal (₹)"
                    icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                    description="Minimum withdrawal amount"
                  >
                    <input 
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.payoutMinAmount?.value ?? 100} 
                      onChange={(e) => change('payoutMinAmount', Number(e.target.value))} 
                    />
                  </Field>
                  <Field 
                    label="Max. Withdrawal (₹)"
                    icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                    description="Maximum withdrawal amount"
                  >
                    <input 
                      type="number"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.maxWithdrawal?.value ?? 50000} 
                      onChange={(e) => change('maxWithdrawal', Number(e.target.value))} 
                    />
                  </Field>
                  <Field 
                    label="Tax Percentage (%)"
                    icon={<Percent className="w-4 h-4 text-gray-400" />}
                    description="Tax deducted from earnings"
                  >
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.taxPercentage?.value ?? 18} 
                      onChange={(e) => change('taxPercentage', Number(e.target.value))} 
                    />
                  </Field>
                </div>
              </Section>

              {/* Referral & Commission Settings */}
              <Section 
                title="Referral & Commission" 
                icon={<Users className="w-5 h-5" />}
                description="Referral and commission configurations"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="Referral Percentage (%)"
                    icon={<Percent className="w-4 h-4 text-gray-400" />}
                    description="Earnings from referred users"
                  >
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.referralPercent?.value ?? 5} 
                      onChange={(e) => change('referralPercent', Number(e.target.value))} 
                    />
                  </Field>
                  <Field 
                    label="Default Commission (%)"
                    icon={<Percent className="w-4 h-4 text-gray-400" />}
                    description="Default commission rate"
                  >
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      value={form.defaultCommission?.value ?? 15} 
                      onChange={(e) => change('defaultCommission', Number(e.target.value))} 
                    />
                  </Field>
                </div>
              </Section>
            </div>

            {/* Right Column - Additional Settings */}
            <div className="space-y-6">
              {/* Toggle Settings */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Platform Features
                </h3>
                
                <div className="space-y-3">
                  <ToggleSetting
                    label="Maintenance Mode"
                    description="Temporarily disable the platform"
                    checked={additionalSettings.maintenanceMode}
                    onChange={() => toggleSetting('maintenanceMode')}
                  />
                  <ToggleSetting
                    label="User Registration"
                    description="Allow new user registrations"
                    checked={additionalSettings.userRegistration}
                    onChange={() => toggleSetting('userRegistration')}
                  />
                  <ToggleSetting
                    label="Email Notifications"
                    description="Send email notifications to users"
                    checked={additionalSettings.emailNotifications}
                    onChange={() => toggleSetting('emailNotifications')}
                  />
                  <ToggleSetting
                    label="SMS Notifications"
                    description="Send SMS notifications"
                    checked={additionalSettings.smsNotifications}
                    onChange={() => toggleSetting('smsNotifications')}
                  />
                  <ToggleSetting
                    label="Auto-approve Payouts"
                    description="Automatically approve withdrawal requests"
                    checked={additionalSettings.autoApprovePayouts}
                    onChange={() => toggleSetting('autoApprovePayouts')}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save All Changes
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Defaults
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      Changes may take a few minutes to propagate across the system.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </form>
      )}
    </div>
  )
}

function Section({ title, icon, description, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, icon, description, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </label>
      {description && (
        <div className="text-xs text-gray-500 mb-2">{description}</div>
      )}
      {children}
    </div>
  )
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-gray-800' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}