'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, CheckCircle, Shield, TrendingUp, Zap, Users,
  Sparkles, Star, ChevronRight, ExternalLink, DollarSign,
  BarChart3, Globe, Clock, ShoppingBag
} from 'lucide-react';

function normalizeList(obj) {
  const candidate =
    (obj?.data?.items && Array.isArray(obj.data.items) && obj.data.items) ||
    (obj?.data && Array.isArray(obj.data) && obj.data) ||
    (obj?.items && Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj) ? obj : []);
  return Array.isArray(candidate) ? candidate : [];
}

export default function HomeMarketing() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  const safeJson = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    const txt = await res.text().catch(() => '');
    return { success: false, message: txt };
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const params = new URLSearchParams({ limit: '12', sort: 'popular' });
        const res = await fetch(`${base}/api/products?${params.toString()}`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await safeJson(res);
        if (res.ok) {
          setProducts(normalizeList(data));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    if (base) loadProducts();
    return () => controller.abort();
  }, [base]);

  const requireLoginToGenerate = (productId) => {
    if (productId) {
      router.push(`/login?next=/dashboard/affiliate&product=${productId}`);
    } else {
      router.push('/login?next=/dashboard/affiliate');
    }
  };

  const stats = [
    { label: 'Active Affiliates', value: '10,000+', icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Payouts', value: '₹2.5Cr+', icon: <DollarSign className="w-5 h-5" />, color: 'from-green-500 to-emerald-600' },
    { label: 'Success Rate', value: '98.7%', icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-pink-600' },
    { label: 'Avg Payout Time', value: '24 Hours', icon: <Clock className="w-5 h-5" />, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Animated Background Elements (hidden on mobile for clarity) */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-gradient-to-r from-blue-100/10 to-cyan-100/10 blur-3xl"></div>
        </div>

        <div className="container relative mx-auto px-4 py-10 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">

              {/* Left Content */}
              <div className="lg:w-1/2 w-full">
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 mb-4 sm:mb-6 shadow-sm backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-blue-600 sm:animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-blue-700">
                    ✨ Join 10,000+ Earning Affiliates
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Turn Your
                  <span className="block mt-1 sm:mt-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient-x">
                      Recommendations Into Income
                    </span>
                  </span>
                </h1>

                {/* Subheading */}
                <p className="mt-4 sm:mt-6 text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl">
                  Share products you love, earn commissions up to 40%, and get paid directly to
                  your bank or UPI. Start earning in minutes — no experience needed.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => router.push('/register')}
                    className="px-5 py-2.5 sm:px-7 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-2 sm:gap-3 group"
                  >
                    {/* <Zap className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" /> */}
                    <span className="text-sm sm:text-base">Start Earning Free</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* <Link
                    href="/demo"
                    className="px-5 py-2.5 sm:px-7 sm:py-3 bg-white border border-gray-200 sm:border-2 text-gray-800 font-semibold rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 group"
                  >
                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="text-sm sm:text-base">Watch Demo</span>
                  </Link> */}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">No Fees</div>
                      <div className="text-xs text-gray-500">Free to join</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">Secure</div>
                      <div className="text-xs text-gray-500">Bank-level</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">24h Payout</div>
                      <div className="text-xs text-gray-500">Fastest</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Stats Card */}
              <div className="lg:w-1/2 w-full">
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-3xl p-5 sm:p-8 shadow-xl sm:shadow-2xl shadow-blue-500/10 backdrop-blur-sm">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Real-time Affiliate Stats</h3>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">See what our community is achieving</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                            {stat.icon}
                          </div>
                          <div className="text-right">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Generator Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 border border-blue-100/50">
                    <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="text-sm sm:text-base">Try Link Generator</span>
                    </h4>
                    <button
                      onClick={() => requireLoginToGenerate()}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-dashed sm:border-2 border-blue-300 rounded-lg text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Paste any product URL...</span>
                        <div className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-semibold rounded-full group-hover:scale-105 transition-transform">
                          Generate
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trusted By Section */}
            <div className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-gray-200/50">
              <p className="text-center text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm font-medium">TRUSTED BY THOUSANDS OF AFFILIATES</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-8 opacity-70">
                {['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Swiggy'].map((brand, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-300">{brand}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <HowItWorks />

      {/* Popular Products - Enhanced */}
      <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 mb-3 sm:mb-4">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-semibold text-blue-700">TRENDING NOW</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              High Converting
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> Products</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg">
              Products with proven track records and high affiliate earnings
            </p>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 animate-pulse">
                  <div className="h-36 sm:h-48 bg-gray-200 rounded-xl mb-3 sm:mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-10 sm:py-12">
              <div className="text-gray-400 text-sm sm:text-lg">No products found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <div
                  key={product._id || product.id || index}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-500 transform hover:-translate-y-1"
                >
                  {/* Product Image Container */}
                  <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.title || product.name || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Store Badge */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-semibold shadow-sm max-w-[65%] truncate">
                      {product.store?.name || 'Store'}
                    </div>

                    {/* Commission Badge */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">
                      Up to 40%
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-5">
                    <div className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium mb-2 truncate">
                      {product.category || 'Product'}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-1">
                      {product.title || product.name || 'Product Name'}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'Premium product with high conversion rate'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      {product.price ? (
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">₹{Number(product.price).toLocaleString()}</div>
                      ) : (
                        <div className="text-sm text-gray-500">Price varies</div>
                      )}

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-[10px] sm:text-xs text-gray-500 ml-1">(4.8)</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => requireLoginToGenerate(product._id || product.id)}
                        className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          <span className="text-sm">Generate Link</span>
                        </span>
                      </button>

                      {/* <Link
                        href={`/products/${product._id || product.id || ''}`}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && products.length > 0 && (
            <div className="text-center mt-10 sm:mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Explore All Products</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Platform Features - Enhanced */}
      <Features />

      {/* Testimonials - Enhanced */}
      <Testimonials />

      <StyleTag />
    </main>
  );
}

// HowItWorks Component - Enhanced
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Sign Up Free',
      description: 'Create your account in 30 seconds. No credit card required.',
      icon: <Users className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      number: '02',
      title: 'Generate Links',
      description: 'Paste any product URL and get your personalized affiliate link instantly.',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    },
    {
      number: '03',
      title: 'Share & Promote',
      description: 'Share your links on social media, blogs, or with your audience.',
      icon: <Globe className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      number: '04',
      title: 'Earn & Withdraw',
      description: 'Receive commissions directly to your bank or UPI every week.',
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Start Earning in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> 4 Simple Steps</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg">
            Our platform makes affiliate marketing accessible to everyone
          </p>
        </div>

        <div className="relative">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-3/4">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 hover:border-blue-300 hover:shadow-2xl transition-all duration-500">
                  {/* Step Number */}
                  <div className={`absolute -top-5 -left-5 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${step.gradient} text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xl`}>
                    {step.number}
                  </div>

                  {/* Icon Container */}
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl ${step.gradient} text-white flex items-center justify-center mb-5 sm:mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>

                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{step.description}</p>

                  {/* Progress Bar */}
                  <div className="mt-4 sm:mt-6 h-2 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Component - Enhanced
function Features() {
  const features = [
    {
      icon: '🚀',
      title: 'Instant Link Generation',
      description: 'Generate trackable affiliate links in seconds with our intelligent system.',
      textColor: 'text-blue-600',
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track clicks, conversions, and earnings with detailed, easy-to-understand dashboards.',
      textColor: 'text-cyan-600',
      iconColor: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    },
    {
      icon: '👥',
      title: 'Referral Program',
      description: 'Earn extra by referring friends. Get 10% of their lifetime earnings.',
      textColor: 'text-purple-600',
      iconColor: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      icon: '💸',
      title: 'Fast Payouts',
      description: 'Withdraw earnings to UPI or bank account within 24 hours.',
      textColor: 'text-green-600',
      iconColor: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      icon: '🛡️',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime and accurate tracking.',
      textColor: 'text-orange-600',
      iconColor: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      icon: '🌟',
      title: 'Premium Support',
      description: 'Get help from our affiliate success team whenever you need it.',
      textColor: 'text-indigo-600',
      iconColor: 'bg-gradient-to-br from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> Platform</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg">
            Everything you need to succeed as an affiliate marketer in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${feature.iconColor} flex items-center justify-center text-xl sm:text-2xl transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-base sm:text-xl font-bold ${feature.textColor} mb-2 sm:mb-3`}>{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              </div>

              {/* Animated Border Bottom */}
              <div className="mt-4 sm:mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Component - Enhanced
function Testimonials() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Fashion Blogger',
      content: 'I earned ₹85,000 last month just by sharing links on my Instagram. The platform is incredibly easy to use!',
      avatar: 'PS',
      rating: 5,
      earnings: '₹3.2L total',
      platform: 'Instagram',
    },
    {
      name: 'Rahul Verma',
      role: 'Tech YouTuber',
      content: 'As a tech reviewer, I promote gadgets I believe in. Earnko makes tracking commissions effortless.',
      avatar: 'RV',
      rating: 5,
      earnings: '₹5.7L total',
      platform: 'YouTube',
    },
    {
      name: 'Neha Patel',
      role: 'Lifestyle Influencer',
      content: 'The real-time analytics helped me optimize my strategy. My earnings increased by 300% in 3 months.',
      avatar: 'NP',
      rating: 5,
      earnings: '₹4.8L total',
      platform: 'Blog',
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-amber-200/50 mb-3 sm:mb-4">
            <Star className="w-4 h-4 text-amber-600 fill-current" />
            <span className="text-xs sm:text-sm font-semibold text-amber-700">TRUSTED BY 10,000+ AFFILIATES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Success Stories from
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> Our Community</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg">
            Hear from affiliates who are already earning with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 hover:border-blue-300 hover:shadow-2xl transition-all duration-500"
            >
              {/* Quote Mark */}
              <div className="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center text-xl sm:text-2xl shadow-xl">
                "
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 sm:mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 text-base sm:text-lg italic mb-6 sm:mb-8 leading-relaxed">"{testimonial.content}"</p>

              <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full inline-block">
                    <div className="text-sm font-bold text-green-600">{testimonial.earnings}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// PlayCircle icon for demo button
function PlayCircle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
  );
}

// Utility CSS for line clamping on titles without plugin
const styles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 6s ease infinite;
  }
  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

function StyleTag() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}