export const uploadedDocsData = {
  labels: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  datasets: [
    {
      label: 'Tài Liệu Được Tải Lên',
      data: [120, 190, 300, 500, 400, 600],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.3)',
      tension: 0.4,
    },
  ],
};

export const downloadedDocsData = {
  labels: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  datasets: [
    {
      label: 'Tài Liệu Được Tải Xuống',
      data: [80, 150, 250, 450, 350, 500],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
      tension: 0.4,
    },
  ],
};

export const usersData = {
  labels: ['Hoạt Động', 'Không Hoạt Động', 'Mới'],
  datasets: [
    {
      label: 'Người Dùng',
      data: [1500, 300, 200],
      backgroundColor: ['#4BC0C0', '#FF6384', '#36A2EB'],
    },
  ],
};

export const revenueData = {
  labels: ['Khóa Học', 'Quảng Cáo', 'Dịch Vụ'],
  datasets: [
    {
      label: 'Doanh Thu',
      data: [5000, 2000, 3000],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    },
  ],
};

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1, // Ensures 1:1 width-to-height ratio for Bar and Pie charts
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      enabled: true,
    },
  },
};

export const lineChartOptions = {
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