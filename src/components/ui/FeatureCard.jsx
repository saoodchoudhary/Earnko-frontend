// components/ui/FeatureCard.tsx


export default function FeatureCard({ icon, title, description, gradient = "from-gray-50 to-white" }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}>
      <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}