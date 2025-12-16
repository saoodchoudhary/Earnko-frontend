'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    payoutMinAmount: { value: 100, group: 'payments', description: 'Minimum amount for withdrawal (₹)' },
    referralPercent: { value: 5, group: 'referral', description: 'Referral percentage (%)' },
    frontendUrl: { value: '', group: 'platform', description: 'Frontend URL' },
    backendUrl: { value: '', group: 'platform', description: 'Backend URL' },
  })

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/settings`, {
          signal: controller.signal, headers: { Authorization: token ? `Bearer ${token}` : '' }
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
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    load()
    return () => controller.abort()
  }, [])

  const change = (key, val) => setForm(prev => ({ ...prev, [key]: { ...prev[key], value: val } }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/admin/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save')
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {loading ? (
        <div className="h-24 skeleton rounded" />
      ) : (
        <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-4">
          <Section title="Platform">
            <Field label="Frontend URL">
              <input className="input" value={form.frontendUrl?.value || ''} onChange={(e) => change('frontendUrl', e.target.value)} placeholder="http://localhost:3000" />
            </Field>
            <Field label="Backend URL">
              <input className="input" value={form.backendUrl?.value || ''} onChange={(e) => change('backendUrl', e.target.value)} placeholder="http://localhost:8080" />
            </Field>
          </Section>

          <Section title="Payments">
            <Field label="Minimum Payout (₹)">
              <input className="input" type="number" value={form.payoutMinAmount?.value ?? 100} onChange={(e) => change('payoutMinAmount', Number(e.target.value))} />
            </Field>
          </Section>

          <Section title="Referral">
            <Field label="Referral Percentage (%)">
              <input className="input" type="number" value={form.referralPercent?.value ?? 5} onChange={(e) => change('referralPercent', Number(e.target.value))} />
            </Field>
          </Section>

          <div className="flex justify-end">
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
          </div>
        </form>
      )}
    </main>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}
function Field({ label, children }) {
  return (
    <label className="text-sm">
      <div className="text-gray-500 mb-1">{label}</div>
      {children}
    </label>
  )
}