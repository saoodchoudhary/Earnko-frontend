// components/ui/WorkflowStep.tsx


export default function WorkflowStep({ number, title, description, icon, delay }) {
  return (
    <div 
      className="relative bg-white rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-center text-lg font-bold shadow-lg">
        {number}
      </div>
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}