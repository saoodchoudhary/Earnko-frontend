'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Settings as SettingsIcon, User, Phone, CreditCard,
  Banknote, Shield, RefreshCw, Lock, Eye, EyeOff, Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    payout: {
      upiId: '',
      bank: {
        holderName: '',
        accountNumber: '',
        ifsc: '',
        bankName: ''
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payout' | 'security'
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          // Auto-redirect if not logged in
          if (typeof window !== 'undefined') window.location.href = '/login?next=/dashboard/settings';
          return;
        }
        setLoading(true);

        const [rMe, rProfile] = await Promise.all([
          fetch(`${base}/api/auth/me`, {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${base}/api/user/profile`, {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const dMe = await safeJson(rMe);
        const dProf = await safeJson(rProfile);

        if (!rMe.ok || !rProfile.ok) {
          const msg = dMe?.message || dProf?.message || 'Failed to load settings';
          toast.error(msg);
          return;
        }

        setForm({
          name: dProf?.data?.profile?.name || dMe?.data?.user?.name || '',
          email: dMe?.data?.user?.email || '',
          phone: dProf?.data?.profile?.phone || '',
          payout: dProf?.data?.profile?.payout || {
            upiId: '',
            bank: { holderName: '', accountNumber: '', ifsc: '', bankName: '' }
          }
        });
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error loading profile:', error);
          toast.error('Error loading settings');
        }
      } finally {
        setLoading(false);
      }
    }
    if (base) load();
    return () => controller.abort();
  }, [base]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          payout: form.payout
        })
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile');
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to change password');

      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'payout', label: 'Payout', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Account Settings</h1>
                <p className="text-blue-100 mt-1">Manage your profile and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4">
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-3 rounded-lg transition-all text-sm ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 border-l-4 md:border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center gap-3 mb-5 md:mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                        <p className="text-gray-600 text-sm mt-1">Update your basic profile details</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
                              value={form.email}
                              readOnly
                              disabled
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Email cannot be changed</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              type="tel"
                              placeholder="e.g. 9876543210"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>Save Changes</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Payout Tab */}
                {activeTab === 'payout' && (
                  <div>
                    <div className="flex items-center gap-3 mb-5 md:mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Payout Information</h2>
                        <p className="text-gray-600 text-sm mt-1">Set up how you receive payments</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* UPI Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 md:p-5">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-green-600" />
                          UPI Details
                        </h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UPI ID
                          </label>
                          <input
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            value={form.payout?.upiId || ''}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                payout: {
                                  ...form.payout,
                                  upiId: e.target.value
                                }
                              })
                            }
                            placeholder="yourupi@bank"
                          />
                          <div className="text-xs text-gray-500 mt-2">
                            Enter your UPI ID for instant transfers
                          </div>
                        </div>
                      </div>

                      {/* Bank Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 md:p-5">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          Bank Account Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Holder Name
                            </label>
                            <input
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={form.payout?.bank?.holderName || ''}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  payout: {
                                    ...form.payout,
                                    bank: { ...form.payout.bank, holderName: e.target.value }
                                  }
                                })
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Number
                            </label>
                            <input
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={form.payout?.bank?.accountNumber || ''}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  payout: {
                                    ...form.payout,
                                    bank: { ...form.payout.bank, accountNumber: e.target.value }
                                  }
                                })
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              IFSC Code
                            </label>
                            <input
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={form.payout?.bank?.ifsc || ''}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  payout: {
                                    ...form.payout,
                                    bank: { ...form.payout.bank, ifsc: e.target.value }
                                  }
                                })
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Name
                            </label>
                            <input
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={form.payout?.bank?.bankName || ''}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  payout: {
                                    ...form.payout,
                                    bank: { ...form.payout.bank, bankName: e.target.value }
                                  }
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>Your payout information is securely encrypted</span>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>Save Payout Details</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <div className="flex items-center gap-3 mb-5 md:mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
                        <p className="text-gray-600 text-sm mt-1">Manage your account security</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 md:p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <Eye className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                          Password must be at least 6 characters long
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>Change Password</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}