'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users, Link as LinkIcon, Gift, DollarSign,
  Copy, CheckCircle, TrendingUp,
  UserPlus, Award, Share2, Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReferralsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState('');
  const [referred, setReferred] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [totals, setTotals] = useState({ totalRewards: 0, totalAmount: 0 });
  const [copied, setCopied] = useState(false);

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
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login');
          router.push('/login?next=/dashboard/referrals');
          return;
        }
        if (!base) {
          toast.error('Backend URL not configured');
          return;
        }

        const res = await fetch(`${base}/api/user/referrals`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` }
        });

        const js = await safeJson(res);
        if (!res.ok) throw new Error(js?.message || 'Failed to load referrals');

        setLink(js?.data?.referralLink || '');
        setReferred(Array.isArray(js?.data?.referred) ? js.data.referred : []);
        setRewards(Array.isArray(js?.data?.rewards) ? js.data.rewards : []);
        setTotals(js?.data?.totals || { totalRewards: 0, totalAmount: 0 });
      } catch (err) {
        if (err?.name !== 'AbortError') toast.error(err?.message || 'Error loading');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [base, router]);

  const copyLink = async () => {
    try {
      if (!link) return toast.error('Link unavailable');
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const shareLink = async () => {
    if (navigator.share && link) {
      try {
        await navigator.share({
          title: 'Join Earnko & Start Earning',
          text: 'Earn money by sharing products you love!',
          url: link,
        });
        toast.success('Shared successfully!');
      } catch (_) {}
    } else {
      copyLink();
    }
  };

  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const statusLabel = (s) => {
    const x = String(s || '').toLowerCase();
    if (x === 'credited') return 'Credited';
    if (x === 'pending') return 'Pending';
    if (x === 'reversed') return 'Reversed';
    return 'Unknown';
  };

  const statusBadge = (s) => {
    const x = String(s || '').toLowerCase();
    if (x === 'credited') return 'bg-green-100 text-green-700';
    if (x === 'pending') return 'bg-amber-100 text-amber-700';
    if (x === 'reversed') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const quick = useMemo(() => {
    const activeReferrals = referred.length; // backend doesn’t return isActive, so count all
    const pendingRewards = rewards.filter(r => String(r.status).toLowerCase() === 'pending').length;
    const creditedRewards = rewards.filter(r => String(r.status).toLowerCase() === 'credited').length;
    const avgReward = rewards.length
      ? Math.round(rewards.reduce((a, b) => a + Number(b.amount || 0), 0) / rewards.length)
      : 0;

    return { activeReferrals, pendingRewards, creditedRewards, avgReward };
  }, [referred, rewards]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Refer & Earn</h1>
              <p className="text-blue-100 mt-1">Invite friends and earn commission on their earnings</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Rewards" value={totals.totalRewards} icon={<Award className="w-5 h-5" />} color="from-blue-500 to-blue-600" description="Referral reward entries" />
              <StatCard title="Total Earnings" value={fmtINR(totals.totalAmount || 0)} icon={<DollarSign className="w-5 h-5" />} color="from-green-500 to-emerald-600" description="From referrals" />
              <StatCard title="Referred Users" value={referred.length} icon={<UserPlus className="w-5 h-5" />} color="from-purple-500 to-pink-600" description="Joined via your link" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your Referral Link</h2>
                  <p className="text-gray-600 text-sm">Share this link to invite friends</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start sm:items-center gap-2 sm:flex-1 min-w-0">
                    <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="text-sm text-gray-900 break-all sm:truncate sm:break-normal min-w-0">
                      {loading ? 'Loading...' : (link || 'Link not available')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                    <button
                      onClick={shareLink}
                      disabled={!link}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 w-full sm:w-auto disabled:opacity-50"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={copyLink}
                      disabled={!link}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 w-full sm:w-auto disabled:opacity-50"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Earn 10% of your friend&apos;s earnings (as per program rules)
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Referred Users
                </h2>
                <p className="text-gray-600 text-sm mt-1">People who joined using your link</p>
              </div>

              {loading ? (
                <div className="p-6">
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : referred.length === 0 ? (
                <div className="p-6 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No referrals yet</h3>
                  <p className="text-gray-600">Share your link to start earning rewards</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {referred.map(user => (
                    <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                          <div className="text-sm font-bold text-blue-600">
                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{user.name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <a
                              href={user.email ? `mailto:${user.email}` : '#'}
                              className="break-all sm:break-normal sm:truncate"
                              title={user.email || 'No email'}
                              onClick={(e) => { if (!user.email) e.preventDefault(); }}
                            >
                              {user.email || 'No email'}
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          </div>
                          <div className="text-xs text-green-600 font-medium">Joined</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  Referral Rewards
                </h2>
                <p className="text-gray-600 text-sm mt-1">Earnings from your referrals</p>
              </div>

              {loading ? (
                <div className="p-6">
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ) : rewards.length === 0 ? (
                <div className="p-6 text-center">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No rewards earned yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {rewards.map(reward => (
                    <div key={reward._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {reward.referred?.name || 'Anonymous User'}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="break-all sm:break-normal sm:truncate" title={reward.referred?.email || ''}>
                              {reward.referred?.email || ''}
                            </span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${statusBadge(reward.status)}`}>
                          {statusLabel(reward.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600 truncate">
                          Order: {reward.transaction?.orderId || 'N/A'}
                        </div>
                        <div className="font-bold text-green-600 shrink-0">
                          {fmtINR(reward.amount || reward.transaction?.commissionAmount || 0)}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        {reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                How It Works
              </h3>

              <div className="space-y-3">
                {[
                  { step: 1, title: 'Share Your Link', desc: 'Share your unique referral link' },
                  { step: 2, title: 'Friends Join', desc: 'Friends sign up using your link' },
                  { step: 3, title: 'Earn Rewards', desc: "You earn referral rewards when their earnings are credited" }
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="text-xs font-bold text-blue-600">{s.step}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{s.title}</div>
                      <div className="text-xs text-gray-600">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Referred Users</span>
                  <span className="text-sm font-bold text-gray-900">{quick.activeReferrals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Rewards</span>
                  <span className="text-sm font-bold text-amber-600">{quick.pendingRewards}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Credited Rewards</span>
                  <span className="text-sm font-bold text-green-600">{quick.creditedRewards}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Reward</span>
                  <span className="text-sm font-bold text-purple-600">{fmtINR(quick.avgReward)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
      {description && <div className="text-xs text-gray-400 mt-2">{description}</div>}
    </div>
  );
}