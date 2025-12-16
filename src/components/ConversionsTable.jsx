'use client';

export default function ConversionsTable({ items = [], admin = false }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Order ID</th>
            <th className="p-2 text-left">Store</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Commission</th>
            <th className="p-2 text-left">Status</th>
            {admin && <th className="p-2 text-left">User</th>}
            <th className="p-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map(tx => (
            <tr key={tx._id} className="border-t">
              <td className="p-2">{tx.orderId || '-'}</td>
              <td className="p-2">{tx.store?.name || '-'}</td>
              <td className="p-2">₹{Number(tx.amount || 0).toFixed(2)}</td>
              <td className="p-2">₹{Number(tx.commission || 0).toFixed(2)}</td>
              <td className="p-2 capitalize">{tx.status || 'pending'}</td>
              {admin && <td className="p-2">{tx.user?.email || tx.user?._id || '-'}</td>}
              <td className="p-2">{new Date(tx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="p-4 text-center text-muted" colSpan={admin ? 7 : 6}>No conversions</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}