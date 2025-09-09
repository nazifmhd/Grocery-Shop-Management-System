import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: any;
  period: string;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, period }) => {
  // Generate sample data for demonstration
  const generateSampleData = () => {
    const days = period === '1d' ? 24 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const labels = [];
    const revenueData = [];
    const transactionData = [];

    for (let i = 0; i < days; i++) {
      if (period === '1d') {
        labels.push(`${i}:00`);
      } else {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        labels.push(date.toLocaleDateString());
      }
      
      revenueData.push(Math.floor(Math.random() * 1000) + 500);
      transactionData.push(Math.floor(Math.random() * 50) + 10);
    }

    return { labels, revenueData, transactionData };
  };

  const { labels, revenueData, transactionData } = data?.chart_data || generateSampleData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Transactions',
        data: transactionData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Transactions'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SalesChart;
