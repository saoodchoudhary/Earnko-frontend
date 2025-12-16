'use client';

export default function StatCard({ title, value, prefix }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-muted">{title}</div>
      <div className="text-2xl font-semibold">{prefix}{Number(value).toFixed(2)}</div>
    </div>
  );
}