// components/ui/StatCard.tsx

export default function StatCard({ title, value, change }) {
  const isPositive = change?.startsWith('+')
  
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-300">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}