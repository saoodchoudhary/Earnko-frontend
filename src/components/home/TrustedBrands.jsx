// components/home/TrustedBrands.tsx - Alternative Version
'use client'
import Image from 'next/image'

export default function TrustedBrands() {
  const brands = [
    { name: 'Amazon', logo: '/logos/amazon.svg' },
    { name: 'Flipkart', logo: '/logos/flipkart.png' },
    { name: 'Myntra', logo: '/logos/myntra.png' },
    { name: 'Jio Mart', logo: '/logos/jiomart.jpg' },
    { name: 'Nykaa', logo: '/logos/nykaa.png' },
    { name: 'Samsung', logo: '/logos/samsung.jpg' },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Trusted by Industry Leaders
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We partner with the world's leading e-commerce platforms to maximize your earning potential
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="relative w-32 h-10">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                  sizes="(max-width: 768px) 100px, 150px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>500+ Partner Stores</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Highest Commission Rates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}