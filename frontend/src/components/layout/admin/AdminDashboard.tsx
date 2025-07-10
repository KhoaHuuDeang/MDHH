"use client";

import { useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  uploadedDocsData,
  downloadedDocsData,
  usersData,
  revenueData,
  chartOptions,
  lineChartOptions,
} from '../../../data/mockChart';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  // State to manage the selected chart (uploaded or downloaded documents)
  const [selectedChart, setSelectedChart] = useState('uploaded');

  // Determine which data to display based on the selected chart
  const chartData = selectedChart === 'uploaded' ? uploadedDocsData : downloadedDocsData;

  return (
    <div className="flex-1 p-4 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Line Chart: Uploaded/Downloaded Documents */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Tài Liệu</h3>
            <select aria-label='#'
              className="border rounded-md p-2"
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
            >
              <option value="uploaded">Tài Liệu Được Tải Lên</option>
              <option value="downloaded">Tài Liệu Được Tải Xuống</option>
            </select>
          </div>
          <div className="w-full h-[400px]">
            <Line data={chartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Bar Chart: Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Người Dùng</h3>
          <div className="w-full max-w-[400px] mx-auto aspect-square">
            <Bar data={usersData} options={chartOptions} />
          </div>
        </div>

        {/* Pie Chart: Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Doanh Thu</h3>
          <div className="w-full max-w-[400px] mx-auto aspect-square">
            <Pie data={revenueData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}