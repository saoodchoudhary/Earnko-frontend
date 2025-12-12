'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/Layout/DashboardLayout'

export default function StoresPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/stores`)
        const data = await res.json()
        if (res.ok) setStores(data.data.stores || data.data || [])
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <DashboardLayout>
      <div className="container mx-auto">
        <h2 className="text-xl font-semibold mb-4">Stores</h2>
        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map(s => (
              <div key={s._id} className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">Commission: {s.commissionRate}{s.commissionType === 'percentage' ? '%' : ' (fixed)'}</div>
                  </div>
                  <div>
                    <Link href={`/stores/${s._id}`} className="text-primary-600 text-sm">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}