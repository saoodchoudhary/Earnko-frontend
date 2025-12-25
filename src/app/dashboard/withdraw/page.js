'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  Wallet, CreditCard, Banknote, Clock, CheckCircle,
  AlertCircle, IndianRupee, RefreshCw, Shield,
  Download, History, ArrowUpRight, Lock
} from 'lucide-react';

export default function WithdrawPage() {
  const [wallet, setWallet] = useState(null);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Saved payout info from Settings
  const [savedPayout, setSavedPayout] = useState({ 
    upiId: '', 
    bank: { 
      holderName: '', 
      accountNumber: '', 
      ifsc: '', 
      bankName: '' 
    } 
  });

  // Form state
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [bank, setBank] = useState({ 
    holderName: '', 
    accountNumber: '', 
    ifsc: '', 
    bankName: '' 
  });
  const [upiId, setUpiId] = useState('');

  // Load wallet summary and saved payout info
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

        const [wRes, pRes] = await Promise.all([
          fetch(`${base}/api/wallet/me`, { 
            signal: controller.signal, 
            headers: { Authorization: token ? `Bearer ${token}` : '' } 
          }),
          fetch(`${base}/api/user/profile`, { 
            signal: controller.signal, 
            headers: { Authorization: token ? `Bearer ${token}` : '' } 
          }),
        ]);

        const wData = await wRes.json();
        const pData = await pRes.json();

        if (wRes.ok) {
          setWallet(wData?.data?.wallet || null);
          setRequestedAmount(wData?.data?.requestedAmount || 0);
        }

        if (pRes.ok) {
          const payout = pData?.data?.profile?.payout || { 
            upiId: '', 
            bank: { 
              holderName: '', 
              accountNumber: '', 
              ifsc: '', 
              bankName: '' 
            } 
          };
          setSavedPayout({
            upiId: payout?.upiId || '',
            bank: {
              holderName: payout?.bank?.holderName || '',
              accountNumber: payout?.bank?.accountNumber || '',
              ifsc: payout?.bank?.ifsc || '',
              bankName: payout?.bank?.bankName || '',
            },
          });

          // Pre-fill form from saved payout
          if (payout?.upiId) {
            setMethod('upi');
            setUpiId(payout.upiId);
          } else {
            setMethod('bank');
            setBank({
              holderName: payout?.bank?.holderName || '',
              accountNumber: payout?.bank?.accountNumber || '',
              ifsc: payout?.bank?.ifsc || '',
              bankName: payout?.bank?.bankName || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  // Keep method-specific fields in sync when user switches method
  useEffect(() => {
    if (method === 'upi' && savedPayout?.upiId) {
      setUpiId((prev) => prev || savedPayout.upiId);
    }
    if (method === 'bank' && savedPayout?.bank) {
      setBank((prev) => ({
        holderName: prev.holderName || savedPayout.bank.holderName || '',
        accountNumber: prev.accountNumber || savedPayout.bank.accountNumber || '',
        ifsc: prev.ifsc || savedPayout.bank.ifsc || '',
        bankName: prev.bankName || savedPayout.bank.bankName || '',
      }));
    }
  }, [method, savedPayout]);

  const canSubmit = useMemo(() => {
    const amtOk = Number(amount) > 0;
    if (!amtOk) return false;
    if (method === 'upi') {
      return Boolean((upiId || '').trim());
    }
    return ['holderName', 'accountNumber', 'ifsc', 'bankName'].every((k) => Boolean((bank?.[k] || '').trim()));
  }, [amount, method, upiId, bank]);

  const availableBalance = wallet?.availableBalance || 0;
  const minimumWithdrawal = 10;
  const maximumWithdrawal = 50000;

  const submitWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) {
      toast.error('Please fill all required fields');
      return;
    }

    const withdrawalAmount = Number(amount);
    
    if (withdrawalAmount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₹${minimumWithdrawal}`);
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (withdrawalAmount > maximumWithdrawal) {
      toast.error(`Maximum withdrawal amount is ₹${maximumWithdrawal}`);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = method === 'bank'
        ? { amount: withdrawalAmount, method, bank }
        : { amount: withdrawalAmount, method, upiId };

      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const res = await fetch(`${base}/api/wallet/withdraw`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to request withdrawal');

      toast.success('Withdrawal request submitted successfully!');
      setAmount('');

      // Refresh wallet data
      const r2 = await fetch(`${base}/api/wallet/me`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      const d2 = await r2.json();
      if (r2.ok) {
        setWallet(d2?.data?.wallet || null);
        setRequestedAmount(d2?.data?.requestedAmount || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const refreshData = () => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const token = localStorage.getItem('token');
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const res = await fetch(`${base}/api/wallet/me`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (res.ok) {
          setWallet(data?.data?.wallet || null);
          setRequestedAmount(data?.data?.requestedAmount || 0);
          toast.success('Wallet data refreshed');
        }
      } catch (error) {
        console.error('Error refreshing:', error);
      }
    }
    refresh();
    return () => controller.abort();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Withdraw Funds</h1>
                <p className="text-blue-100 mt-1">Transfer your earnings to your bank or UPI</p>
              </div>
            </div>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                title="Available Balance" 
                value={availableBalance}
                icon={<Wallet className="w-5 h-5" />}
                color="from-blue-500 to-blue-600"
                isPrimary={true}
              />
              <StatCard 
                title="Confirmed Cashback" 
                value={wallet?.confirmedCashback || 0}
                icon={<CheckCircle className="w-5 h-5" />}
                color="from-green-500 to-emerald-600"
              />
              <StatCard 
                title="Pending Cashback" 
                value={wallet?.pendingCashback || 0}
                icon={<Clock className="w-5 h-5" />}
                color="from-amber-500 to-orange-600"
              />
              <StatCard 
                title="Requested Amount" 
                value={requestedAmount || 0}
                icon={<Lock className="w-5 h-5" />}
                color="from-purple-500 to-pink-600"
              />
              <StatCard 
                title="Total Withdrawn" 
                value={wallet?.totalWithdrawn || 0}
                icon={<IndianRupee className="w-5 h-5" />}
                color="from-indigo-500 to-purple-600"
              />
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Request Withdrawal</h2>
                  <p className="text-gray-600 text-sm mt-1">Transfer your earnings securely</p>
                </div>
              </div>

              <form onSubmit={submitWithdrawal} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <IndianRupee className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      step="0.01"
                      min={minimumWithdrawal}
                      max={availableBalance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Minimum ₹${minimumWithdrawal}`}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      Available: ₹{availableBalance.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAmount(Math.min(availableBalance, maximumWithdrawal))}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Withdraw Max
                    </button>
                  </div>
                </div>

                {/* Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod('bank')}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        method === 'bank' 
                          ? 'border-blue-500 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">Bank Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('upi')}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        method === 'upi' 
                          ? 'border-blue-500 bg-blue-50 text-blue-600' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <ArrowUpRight className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">UPI Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Method Details */}
                {method === 'upi' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourupi@bank"
                        required
                      />
                      {savedPayout?.upiId && (
                        <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Using saved UPI ID from your profile
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bank.holderName}
                        onChange={(e) => setBank({ ...bank, holderName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bank.accountNumber}
                        onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bank.ifsc}
                        onChange={(e) => setBank({ ...bank, ifsc: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bank.bankName}
                        onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                        required
                      />
                    </div>
                    {(savedPayout?.bank?.accountNumber || savedPayout?.bank?.holderName) && (
                      <div className="md:col-span-2 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Using saved bank details from your profile
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !canSubmit || Number(amount) < minimumWithdrawal || Number(amount) > availableBalance}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      Request Withdrawal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Info & Requirements */}
          <div className="space-y-6">
            {/* Saved Payout Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Saved Payout Details
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ) : (savedPayout?.upiId || savedPayout?.bank?.accountNumber) ? (
                <div className="space-y-3">
                  {savedPayout?.upiId && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-xs text-gray-600">UPI ID</div>
                      <div className="font-mono text-sm font-medium">{savedPayout.upiId}</div>
                    </div>
                  )}
                  {savedPayout?.bank?.accountNumber && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <div className="text-xs text-gray-600">Bank Account</div>
                      <div className="text-sm font-medium">{savedPayout.bank.holderName}</div>
                      <div className="font-mono text-xs">{savedPayout.bank.accountNumber}</div>
                      <div className="text-xs text-gray-500">{savedPayout.bank.bankName}</div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Update these details in Settings if needed
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No payout details saved</p>
                  <a 
                    href="/dashboard/settings" 
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
                  >
                    Set up in Settings →
                  </a>
                </div>
              )}
            </div>

            {/* Important Information */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Important Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Processing Time</div>
                    <div className="text-xs text-gray-600">24-48 hours for processing</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Minimum Withdrawal</div>
                    <div className="text-xs text-gray-600">₹{minimumWithdrawal} minimum</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Maximum Withdrawal</div>
                    <div className="text-xs text-gray-600">₹{maximumWithdrawal.toLocaleString()} maximum</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Tax Deduction</div>
                    <div className="text-xs text-gray-600">TDS applicable as per regulations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <a 
                  href="/dashboard/settings" 
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Update Payout Details
                </a>
                <a 
                  href="/dashboard/transactions" 
                  className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" />
                  View Transaction History
                </a>
                <button className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Statements
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, isPrimary = false }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all ${isPrimary ? 'border-blue-200 shadow-sm' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center ${isPrimary ? 'shadow-md' : ''}`}>
          {icon}
        </div>
      </div>
      <div className={`text-xl font-bold ${isPrimary ? 'text-blue-600' : 'text-gray-900'}`}>
        ₹{Number(value || 0).toLocaleString()}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}