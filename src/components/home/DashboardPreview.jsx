// components/home/DashboardPreview.tsx
'use client'
import { Eye, TrendingUp, Calendar, BarChart3, Clock } from 'lucide-react'
import StatCard from '../ui/StatCard'

export default function DashboardPreview() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Real-Time Insights at Your Fingertips</h2>
              <p className="text-xl text-gray-600 mt-4">Monitor your performance with our comprehensive dashboard</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Live Tracking</h4>
                  <p className="text-gray-600 mt-1">Real-time monitoring of clicks, conversions, and revenue across all your links</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">

              <img 
               src='/images/earnko-logo-round.png'
               alt='earnko logo'
               className='w-[40px]'
               />
                {/* <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div> */}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Performance Analytics</h4>
                  <p className="text-gray-600 mt-1">Detailed reports and insights to optimize your affiliate strategy</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Scheduled Reports</h4>
                  <p className="text-gray-600 mt-1">Automated daily, weekly, and monthly reports delivered to your inbox</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Performance Dashboard</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-green-600 font-medium">Live Data</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Preview
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard title="Today's Revenue" value="$1,248" change="+12%" />
                <StatCard title="Total Clicks" value="8,456" change="+8%" />
                <StatCard title="Conversion Rate" value="4.8%" change="+0.4%" />
                <StatCard title="Active Links" value="342" change="+24" />
              </div>

              <div className="space-y-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-3/4 animate-pulse" />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Monthly Target: $5,000</span>
                  <span className="font-medium text-gray-900">75% Complete</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Data updates every 60 seconds • Last updated just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}