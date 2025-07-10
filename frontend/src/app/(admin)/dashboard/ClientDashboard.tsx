// app/dashboard/ClientDashboard.tsx
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

// Sample data for charts
const uploadedDocsData = {
  labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  datasets: [
    {
      label: 'Tài Liệu',
      data: [120, 190, 300, 500, 400, 600],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.3)',
      tension: 0.4,
    },
  ],
};

const usersData = {
  labels: ['Hoạt Động', 'Không Hoạt Động', 'Mới'],
  datasets: [
    {
      label: 'Người Dùng',
      data: [1500, 300, 200],
      backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB'],
    },
  ],
};

const revenueData = {
  labels: ['Khóa Học', 'Quảng Cáo', 'Dịch Vụ'],
  datasets: [
    {
      label: 'Doanh Thu',
      data: [5000, 2000, 3000],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    },
  ],
};

// Chart options with 1:1 aspect ratio and explicit legend position type
const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1, // Ensures 1:1 width-to-height ratio for Bar and Pie charts
  plugins: {
    legend: {
      position: 'top' as const, // Explicitly set to 'top' to satisfy TypeScript
    },
    tooltip: {
      enabled: true,
    },
  },
};

// Line chart options (disable aspect ratio to allow full width)
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Allow the chart to stretch to container width
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      enabled: true,
    },
  },
};

// Client Dashboard component
export default function ClientDashboard() {
  return (
    <div className="flex-1 p-4 sm:p-8">
      {/* <h1 className="text-3xl font-bold mb-8">Trang Quản Trị</h1> */}

      {/* KPI Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Line Chart: Uploaded Documents (Full row, full width, fixed height) */}
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