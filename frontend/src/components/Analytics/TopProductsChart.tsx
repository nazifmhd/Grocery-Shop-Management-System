import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopProductsChartProps {
  data: Array<{
    id: string;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data }) => {
  // Generate sample data if none provided
  const sampleData = [
    { name: 'Milk', quantity_sold: 150, revenue: 450 },
    { name: 'Bread', quantity_sold: 120, revenue: 240 },
    { name: 'Eggs', quantity_sold: 100, revenue: 200 },
    { name: 'Bananas', quantity_sold: 80, revenue: 160 },
    { name: 'Apples', quantity_sold: 75, revenue: 150 },
    { name: 'Chicken', quantity_sold: 60, revenue: 300 },
    { name: 'Rice', quantity_sold: 50, revenue: 100 },
    { name: 'Potatoes', quantity_sold: 45, revenue: 90 },
  ];

  const chartData = data && data.length > 0 ? data.slice(0, 8) : sampleData;

  const chartConfig = {
    labels: chartData.map(item => item.name.length > 10 
      ? item.name.substring(0, 10) + '...' 
      : item.name
    ),
    datasets: [
      {
        label: 'Quantity Sold',
        data: chartData.map(item => item.quantity_sold),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity Sold'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Products'
        }
      }
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartConfig} options={chartOptions} />
    </div>
  );
};

export default TopProductsChart;
