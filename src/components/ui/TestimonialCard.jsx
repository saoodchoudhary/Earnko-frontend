// components/ui/TestimonialCard.tsx
import { Star } from 'lucide-react'

export default function TestimonialCard({ content, author, role, company, avatar, rating = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-500">
      <div className="flex items-center mb-6">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold text-lg">
          {avatar}
        </div>
        <div className="ml-4">
          <div className="font-bold text-gray-900">{author}</div>
          <div className="text-gray-500 text-sm">{role}</div>
          <div className="text-gray-400 text-sm">{company}</div>
        </div>
      </div>
      <p className="text-gray-600 italic mb-6 leading-relaxed">"{content}"</p>
      <div className="flex">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
      </div>
    </div>
  )
}