'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import toast from 'react-hot-toast'
import { 
  Wallet, CreditCard, Banknote, TrendingUp, CheckCircle, 
  Clock, AlertCircle, ArrowUpRight, RefreshCw, ChevronRight,
  Smartphone, Building, Shield
} from 'lucide-react'


export default function WithdrawPage() {
  const [withdrawals, setWithdrawals] = useState([])
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [availableBalance, setAvailableBalance] = useState(12450) // Mock balance - replace with API
  
  // UPI/Bank details state
  const [upiId, setUpiId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountName, setAccountName] = useState('')
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([
    { type: 'upi', id: 'user@okicici', default: true },
    { type: 'bank', bankName: 'HDFC Bank', last4: '7890', default: false }
  ])

  useEffect(() => {
    // Load saved payment methods from localStorage or API
    const savedUpi = localStorage.getItem('saved_upi_id')
    if (savedUpi) setUpiId(savedUpi)
    
    const savedBank = localStorage.getItem('saved_bank_details')
    if (savedBank) {
      try {
        const bankDetails = JSON.parse(savedBank)
        setAccountNumber(bankDetails.accountNumber)
        setIfscCode(bankDetails.ifscCode)
        setAccountName(bankDetails.accountName)
      } catch (e) {}
    }
    
    loadWithdrawals()
  }, [])

  async function loadWithdrawals() {
    setFetching(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/withdrawals`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      })
      const data = await res.json()
      if (res.ok) {
        setWithdrawals(data.data.withdrawals || [])
        // Update available balance from API response
        if (data.data.balance) setAvailableBalance(data.data.balance)
      } else {
        console.error(data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load withdrawals')
    } finally { 
      setFetching(false)
    }
  }

  const validateForm = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return false
    }
    
    if (Number(amount) > availableBalance) {
      toast.error('Amount exceeds available balance')
      return false
    }
    
    if (Number(amount) < 100) {
      toast.error('Minimum withdrawal amount is ₹100')
      return false
    }
    
    if (method === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID')
        return false
      }
    } else if (method === 'bank') {
      if (!accountNumber || accountNumber.length < 9) {
        toast.error('Please enter a valid account number')
        return false
      }
      if (!ifscCode || ifscCode.length !== 11) {
        toast.error('Please enter a valid 11-character IFSC code')
        return false
      }
      if (!accountName || accountName.length < 3) {
        toast.error('Please enter account holder name')
        return false
      }
    }
    
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const methodDetails = method === 'upi' 
        ? { upiId }
        : { accountNumber, ifscCode, accountName }
      
      // Save payment method details
      if (method === 'upi') {
        localStorage.setItem('saved_upi_id', upiId)
      } else {
        localStorage.setItem('saved_bank_details', JSON.stringify({ accountNumber, ifscCode, accountName }))
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/withdrawals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          amount: Number(amount), 
          method, 
          methodDetails 
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success('Withdrawal request submitted successfully!')
        setAmount('')
        loadWithdrawals()
      } else {
        toast.error(data.message || 'Withdrawal request failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Server error occurred')
    } finally { 
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Withdraw Earnings</h1>
          <p className="text-gray-600">Transfer your earnings to UPI or Bank Account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Withdrawal Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Available Balance</h3>
                    <p className="text-sm text-gray-300">Ready to withdraw</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">₹{availableBalance.toLocaleString()}</div>
                  <p className="text-sm text-gray-300 mt-1">Minimum: ₹100</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300">Processing Time</div>
                  <div className="font-bold text-lg">24-48 Hours</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-gray-300">Processing Fee</div>
                  <div className="font-bold text-lg">₹0</div>
                </div>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">New Withdrawal Request</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Withdraw (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Banknote className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
                      placeholder="Enter amount (Min ₹100)"
                      type="number"
                      min="100"
                      max={availableBalance}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">Available: ₹{availableBalance.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setAmount(availableBalance.toString())}
                      className="text-xs text-gray-900 font-medium hover:text-gray-700"
                    >
                      Withdraw Full Amount
                    </button>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMethod('upi')}
                      className={`p-4 border rounded-xl transition-all ${
                        method === 'upi'
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          method === 'upi' ? 'bg-gray-900' : 'bg-gray-100'
                        }`}>
                          <Smartphone className={`w-5 h-5 ${
                            method === 'upi' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">UPI</div>
                          <div className="text-xs text-gray-500">Instant Transfer</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setMethod('bank')}
                      className={`p-4 border rounded-xl transition-all ${
                        method === 'bank'
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          method === 'bank' ? 'bg-gray-900' : 'bg-gray-100'
                        }`}>
                          <Building className={`w-5 h-5 ${
                            method === 'bank' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Bank Transfer</div>
                          <div className="text-xs text-gray-500">1-2 Business Days</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Method Details */}
                {method === 'upi' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <div className="relative">
                        <input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
                          placeholder="username@upi"
                          type="email"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter your UPI ID (e.g., username@okicici, username@ybl)
                      </p>
                    </div>
                    
                    {/* Saved UPI IDs */}
                    {savedPaymentMethods.filter(m => m.type === 'upi').length > 0 && (
                      <div>
                        <div className="text-sm text-gray-700 mb-2">Saved UPI IDs</div>
                        <div className="space-y-2">
                          {savedPaymentMethods
                            .filter(m => m.type === 'upi')
                            .map((method, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setUpiId(method.id)}
                                className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{method.id}</div>
                                    <div className="text-xs text-gray-500">Saved UPI ID</div>
                                  </div>
                                  {method.default && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
                          placeholder="Full name as per bank"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number
                        </label>
                        <input
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
                          placeholder="1234567890"
                          type="text"
                          maxLength={18}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition"
                        placeholder="HDFC0001234"
                        type="text"
                        maxLength={11}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing Request...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-5 h-5" />
                      <span>Request Withdrawal</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Secure & Encrypted</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your payment details are encrypted and stored securely. We never share your banking information.
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Recent Withdrawals */}
          <div className="space-y-8">
            {/* Recent Withdrawals */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Withdrawals</h3>
                <button
                  onClick={loadWithdrawals}
                  disabled={fetching}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${fetching ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {fetching ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No withdrawal requests yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your withdrawal history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.slice(0, 5).map((withdrawal) => (
                    <div
                      key={withdrawal._id}
                      className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-900">₹{withdrawal.amount}</div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          {withdrawal.method === 'upi' ? 'UPI Transfer' : 'Bank Transfer'}
                        </div>
                        <div className="text-gray-500">
                          {formatDate(withdrawal.createdAt)}
                        </div>
                      </div>
                      {withdrawal.methodDetails && (
                        <div className="text-xs text-gray-500 mt-2">
                          {withdrawal.method === 'upi' 
                            ? `To: ${withdrawal.methodDetails.upiId}`
                            : `To: ${withdrawal.methodDetails.accountName} ••••${withdrawal.methodDetails.accountNumber?.slice(-4)}`
                          }
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {withdrawals.length > 5 && (
                    <button className="w-full py-3 text-sm text-gray-900 font-medium hover:text-gray-700 flex items-center justify-center gap-1">
                      View All Withdrawals
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Withdrawal Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Withdrawal Information</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Processing Time</div>
                    <div className="text-xs text-gray-600">UPI: 24 hours • Bank: 2-3 business days</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">No Fees</div>
                    <div className="text-xs text-gray-600">Zero transaction charges on withdrawals</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Minimum Amount</div>
                    <div className="text-xs text-gray-600">₹100 minimum withdrawal limit</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}