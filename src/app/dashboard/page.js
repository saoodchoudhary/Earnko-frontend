'use client';

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyConversions } from '../../store/slices/conversionsSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import StatCard from '../../components/StatCard';
import ConversionsTable from '../../components/ConversionsTable';

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, loadingUser, fetchMe } = useAuth();
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(s => s.wallet.summary);
  const conversions = useAppSelector(s => s.conversions.items);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (!loadingUser && !token) router.push('/login');
    if (token) {
      dispatch(fetchWallet());
      dispatch(fetchMyConversions());
    }
  }, [token, loadingUser, dispatch, router]);

  return (
    <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Welcome, {user?.name || 'User'}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Available Balance" value={wallet?.availableBalance || 0} prefix="₹" />
        <StatCard title="Confirmed Cashback" value={wallet?.confirmedCashback || 0} prefix="₹" />
        <StatCard title="Pending Cashback" value={wallet?.pendingCashback || 0} prefix="₹" />
        <StatCard title="Total Withdrawn" value={wallet?.totalWithdrawn || 0} prefix="₹" />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Conversions</h2>
        <ConversionsTable items={conversions} />
      </section>
    </main>
  );
}