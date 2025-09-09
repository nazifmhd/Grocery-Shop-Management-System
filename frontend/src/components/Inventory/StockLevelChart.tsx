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

interface Product {
  id: string;
  name: string;
  current_stock: number;
  reorder_level: number;
}

interface StockLevelChartProps {
  products: Product[];
}

const StockLevelChart: React.FC<StockLevelChartProps> = ({ products }) => {
  // Get top 10 products by stock level
  const topProducts = products
    .sort((a, b) => b.current_stock - a.current_stock)
    .slice(0, 10);

  const chartData = {
    labels: topProducts.map(product => product.name.length > 15 
      ? product.name.substring(0, 15) + '...' 
      : product.name
    ),
    datasets: [
      {
        label: 'Current Stock',
        data: topProducts.map(product => product.current_stock),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Reorder Level',
        data: topProducts.map(product => product.reorder_level),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
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
        display: true,
        text: 'Stock Levels - Top 10 Products',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
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

  if (products.length === 0) {
    return (
      <div className="chart-container">
        <div className="text-center py-8 text-gray-500">
          <p>No products available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default StockLevelChart;
