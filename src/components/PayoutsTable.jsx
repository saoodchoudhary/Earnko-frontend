'use client';

export default function PayoutsTable({ items = [] }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Method</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Reference</th>
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p._id} className="border-t">
              <td className="p-2">₹{Number(p.amount || 0).toFixed(2)}</td>
              <td className="p-2">{p.method || '-'}</td>
              <td className="p-2 capitalize">{p.status || '-'}</td>
              <td className="p-2">{p.reference || '-'}</td>
              <td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="p-4 text-center text-muted" colSpan={5}>No payouts</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}