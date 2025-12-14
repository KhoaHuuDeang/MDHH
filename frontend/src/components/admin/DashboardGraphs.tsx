'use client'

import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { adminService } from '@/services/adminService.csr'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface GraphDataPoint {
  date: string
  count: number
}

interface GraphData {
  userSignups: GraphDataPoint[]
  upvotes: GraphDataPoint[]
}

export default function DashboardGraphs() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getGraphData()
      .then(data => {
        if (data?.result) {
          setGraphData(data.result)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load graph data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-center py-4">Loading graphs...</div>
  if (!graphData) return null

  // Fill missing dates with 0
  const fillDates = (data: GraphDataPoint[], days: number) => {
    const result: { [key: string]: number } = {}
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      result[dateStr] = 0
    }

    data.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0]
      result[dateStr] = item.count
    })

    return Object.entries(result).map(([date, count]) => ({
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: count
    }))
  }

  const userSignupData = fillDates(graphData.userSignups, 14)
  const upvoteData = fillDates(graphData.upvotes, 14)

  const userSignupChartData = {
    labels: userSignupData.map(d => d.label),
    datasets: [
      {
        label: 'New Users',
        data: userSignupData.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const upvoteChartData = {
    labels: upvoteData.map(d => d.label),
    datasets: [
      {
        label: 'Upvotes',
        data: upvoteData.map(d => d.value),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Signups (Last 14 Days)</h3>
        <div style={{ height: '300px' }}>
          <Line data={userSignupChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Upvotes (Last 14 Days)</h3>
        <div style={{ height: '300px' }}>
          <Line data={upvoteChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
