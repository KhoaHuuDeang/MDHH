"use client";

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
  return (
    <div className="flex-1 p-4 sm:p-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Line Chart: Uploaded Documents */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
          <h3 className="text-xl font-semibold mb-4">Tài Liệu Được Đăng Tải</h3>
          <div className="w-full h-[400px]">
            <Line data={uploadedDocsData} options={lineChartOptions} />
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