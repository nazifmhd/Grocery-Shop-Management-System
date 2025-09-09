import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { SalesChart } from '../components/Analytics/SalesChart';
import { TopProductsChart } from '../components/Analytics/TopProductsChart';
import { CustomerAnalytics } from '../components/Analytics/CustomerAnalytics';
import { api } from '../utils/api';

const Analytics: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('7d');
  const [chartType, setChartType] = useState('revenue');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', timePeriod],
    queryFn: async () => {
      const response = await api.get(`/analytics/dashboard?period=${timePeriod}`);
      return response.data;
    }
  });

  // Fetch sales data for charts
  const { data: salesData } = useQuery({
    queryKey: ['sales-chart', timePeriod],
    queryFn: async () => {
      const response = await api.get(`/sales/analytics?period=${timePeriod}`);
      return response.data;
    }
  });

  // Fetch top products
  const { data: topProducts = [] } = useQuery({
    queryKey: ['top-products', timePeriod],
    queryFn: async () => {
      const response = await api.get(`/analytics/top-products?period=${timePeriod}`);
      return response.data;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex space-x-4">
          <button className="btn btn-secondary">
            Export Report
          </button>
          <button className="btn btn-primary">
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Period */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="form-select pl-10"
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Chart Type */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="form-select pl-10"
            >
              <option value="revenue">Revenue</option>
              <option value="transactions">Transactions</option>
              <option value="customers">Customers</option>
              <option value="products">Products</option>
            </select>
          </div>

          {/* Additional Filters */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select className="form-select pl-10">
              <option value="all">All Categories</option>
              <option value="dairy">Dairy</option>
              <option value="produce">Produce</option>
              <option value="meat">Meat</option>
              <option value="bakery">Bakery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {analyticsData && (
        <div className="metrics-grid mb-6">
          <div className="metric-card">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">
              {formatCurrency(analyticsData.total_revenue || 0)}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +{analyticsData.revenue_growth || 0}% from last period
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Transactions</div>
            <div className="metric-value">{analyticsData.total_transactions || 0}</div>
            <div className="text-sm text-blue-600 mt-1">
              +{analyticsData.transaction_growth || 0}% from last period
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Average Order Value</div>
            <div className="metric-value">
              {formatCurrency(analyticsData.average_order_value || 0)}
            </div>
            <div className="text-sm text-purple-600 mt-1">
              +{analyticsData.aov_growth || 0}% from last period
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">New Customers</div>
            <div className="metric-value">{analyticsData.new_customers || 0}</div>
            <div className="text-sm text-orange-600 mt-1">
              +{analyticsData.customer_growth || 0}% from last period
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <SalesChart data={salesData} period={timePeriod} />
        </div>

        {/* Top Products Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      {/* Customer Analytics */}
      <div className="chart-container mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
        <CustomerAnalytics data={analyticsData} />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Sales Hour</span>
              <span className="font-semibold">2:00 PM - 4:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best Selling Day</span>
              <span className="font-semibold">Saturday</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Retention Rate</span>
              <span className="font-semibold text-green-600">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inventory Turnover</span>
              <span className="font-semibold">4.2x</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-900">Inventory Optimization</p>
              <p className="text-xs text-blue-700">Consider increasing stock for dairy products by 15%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm font-medium text-green-900">Pricing Strategy</p>
              <p className="text-xs text-green-700">Bakery items can be priced 5% higher based on demand</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-md">
              <p className="text-sm font-medium text-yellow-900">Customer Engagement</p>
              <p className="text-xs text-yellow-700">Send promotional emails to inactive customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
