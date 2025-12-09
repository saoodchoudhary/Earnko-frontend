// components/home/Testimonials.tsx
'use client'
import TestimonialCard from '../ui/TestimonialCard'
import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      content: "Earnko has completely transformed how we approach affiliate marketing. The platform's analytics helped us increase our conversion rate by 40% in just three months.",
      author: "Alex Johnson",
      role: "Digital Marketing Director",
      company: "TechReview Pro",
      avatar: "AJ",
      rating: 5
    },
    {
      content: "The automation features save us dozens of hours every week. What used to take a team of three now takes one person thanks to Earnko's smart workflows.",
      author: "Maria Garcia",
      role: "Content Strategist",
      company: "Lifestyle Bloggers Co.",
      avatar: "MG",
      rating: 5
    },
    {
      content: "As a full-time affiliate marketer, I've tried every platform out there. Earnko's reliability and feature set are simply unmatched in the industry.",
      author: "David Kim",
      role: "Professional Affiliate",
      company: "Revenue Growth Inc.",
      avatar: "DK",
      rating: 5
    }
  ]

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Trusted by Industry Leaders</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">See how top creators are growing their earnings with Earnko</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}