'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Zap, Wallet, MoreHorizontal, Grid } from 'lucide-react';

function Item({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${
        active ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-blue-50' : 'bg-transparent'}`}>
        {icon}
      </div>
      <div className="text-[11px] font-semibold">{label}</div>
    </Link>
  );
}

export default function BottomBar() {
  const pathname = usePathname();

  // You can adjust routes as per your app
  const items = [
    { href: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/dashboard/affiliate', label: 'Create', icon: <Zap className="w-5 h-5" /> },
    { href: '/dashboard/wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { href: '/dashboard', label: 'More', icon: <Grid className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed w-full  bottom-0 left-0 right-0 z-[60] md:hidden">
      <div className=" w-full bg-white">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex">
            {items.map((it) => (
              <Item
                key={it.href}
                href={it.href}
                label={it.label}
                icon={it.icon}
                active={pathname === it.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}