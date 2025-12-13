'use client'

import { useEffect, useState } from 'react'
import { csrAxiosClient } from '@/utils/axiosClient'
import { Users, Upload, Download, MessageSquare } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalUploads: number
  totalDownloads: number
  totalComments: number
}

export default function AdminStatsDisplay() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await csrAxiosClient.get('/admin/users/analytics')

        if (response.data?.status === 200 && response.data?.result) {
          const result = response.data.result
          setStats({
            totalUsers: result.totalUsers || 0,
            totalUploads: result.totalUploads || 0,
            totalDownloads: result.totalDownloads || 0,
            totalComments: result.totalComments || 0,
          })
        } else {
          setError('Failed to load admin stats')
        }
      } catch (err) {
        setError('Error fetching admin stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div className="text-center py-4 text-gray-500">Loading stats...</div>
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>
  if (!stats) return <div className="text-center py-4 text-gray-500">No stats available</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <Users className="w-10 h-10 text-blue-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Uploads</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUploads}</p>
          </div>
          <Upload className="w-10 h-10 text-green-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Downloads</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</p>
          </div>
          <Download className="w-10 h-10 text-yellow-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Comments</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalComments}</p>
          </div>
          <MessageSquare className="w-10 h-10 text-purple-500 opacity-80" />
        </div>
      </div>
    </div>
  )
}
