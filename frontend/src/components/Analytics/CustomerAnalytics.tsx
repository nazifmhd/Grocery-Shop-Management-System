import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CustomerAnalyticsProps {
  data: any;
}

const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ data }) => {
  // Generate sample data for demonstration
  const customerSegments = [
    { name: 'Regular', count: 150, color: '#3B82F6' },
    { name: 'Premium', count: 75, color: '#10B981' },
    { name: 'Wholesale', count: 25, color: '#F59E0B' },
    { name: 'New', count: 50, color: '#EF4444' },
  ];

  const chartData = {
    labels: customerSegments.map(segment => segment.name),
    datasets: [
      {
        data: customerSegments.map(segment => segment.count),
        backgroundColor: customerSegments.map(segment => segment.color),
        borderColor: customerSegments.map(segment => segment.color),
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const totalCustomers = customerSegments.reduce((sum, segment) => sum + segment.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer Segments Chart */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Customer Segments</h4>
        <div className="h-64">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900">Customer Metrics</h4>
        
        <div className="space-y-4">
          {customerSegments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {segment.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {segment.count}
                </div>
                <div className="text-xs text-gray-500">
                  {((segment.count / totalCustomers) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">Total Customers</span>
            <span className="text-lg font-bold text-gray-900">{totalCustomers}</span>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Avg. Order Value</div>
            <div className="text-lg font-semibold text-gray-900">$45.20</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Retention Rate</div>
            <div className="text-lg font-semibold text-gray-900">85%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
