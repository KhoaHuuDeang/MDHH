'use client'

import { useEffect, useState } from 'react'

interface Stats {
  documents: number
  users: number
  downloads: number
  discussions: number
}

export default function StatsDisplay() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homepage/stats`)
        const data = await response.json()

        if (data.status === 200 && data.result) {
          setStats(data.result)
        } else {
          setError('Failed to load stats')
        }
      } catch (err) {
        setError('Error fetching stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading stats...</div>
  if (error) return <div>Error: {error}</div>
  if (!stats) return <div>No stats available</div>

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="p-4 bg-blue-100 rounded">
        <div className="text-2xl font-bold">{stats.documents}</div>
        <div className="text-sm text-gray-600">Documents</div>
      </div>
      <div className="p-4 bg-green-100 rounded">
        <div className="text-2xl font-bold">{stats.users}</div>
        <div className="text-sm text-gray-600">Users</div>
      </div>
      <div className="p-4 bg-yellow-100 rounded">
        <div className="text-2xl font-bold">{stats.downloads}</div>
        <div className="text-sm text-gray-600">Downloads</div>
      </div>
      <div className="p-4 bg-purple-100 rounded">
        <div className="text-2xl font-bold">{stats.discussions}</div>
        <div className="text-sm text-gray-600">Discussions</div>
      </div>
    </div>
  )
}
