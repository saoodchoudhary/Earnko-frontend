// app/page.tsx
export const metadata = {
  title: 'Earnko — Turn Links Into Earnings | Affiliate & Cashback Platform',
  description: 'Create affiliate links, share them, and earn commissions. Trusted by creators and brands — reliable tracking, automated commissions and fast payouts.',
  openGraph: {
    title: 'Earnko — Turn Links Into Earnings',
    description: 'Create affiliate links, share them, and earn commissions. Trusted by creators and brands — reliable tracking, automated commissions and fast payouts.',
    url: 'https://yourdomain.com',
    siteName: 'Earnko',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earnko — Turn Links Into Earnings',
    description: 'Create affiliate links, share them, and earn commissions.',
  }
}

import Hero from '@/components/home/Hero'
import Features from '@/components/home/Features'
import HowItWorks from '@/components/home/HowItWorks'
import DashboardPreview from '@/components/home/DashboardPreview'
import Testimonials from '@/components/home/Testimonials'
import TrustedBrands from '@/components/home/TrustedBrands'
import Navbar from '@/components/Layout/Navbar'
import Footer from '@/components/Layout/Footer'

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <TrustedBrands />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}