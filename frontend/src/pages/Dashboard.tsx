import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';

const Dashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [salesResponse, inventoryResponse, customersResponse] = await Promise.all([
        api.get('/sales/analytics?period=7d'),
        api.get('/inventory/summary'),
        api.get('/customers/count')
      ]);
      
      return {
        sales: salesResponse.data,
        inventory: inventoryResponse.data,
        customers: customersResponse.data
      };
    }
  });

  const metrics = [
    {
      name: 'Today\'s Revenue',
      value: `$${dashboardData?.sales?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Transactions',
      value: dashboardData?.sales?.total_transactions?.toString() || '0',
      icon: ShoppingCartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Products in Stock',
      value: dashboardData?.inventory?.total_products?.toString() || '0',
      icon: CubeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Total Customers',
      value: dashboardData?.customers?.total_customers?.toString() || '0',
      icon: UsersIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const alerts = [
    {
      type: 'warning',
      message: `${dashboardData?.inventory?.low_stock_count || 0} products are low on stock`,
      icon: ExclamationTriangleIcon
    },
    {
      type: 'error',
      message: `${dashboardData?.inventory?.out_of_stock_count || 0} products are out of stock`,
      icon: ExclamationTriangleIcon
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your grocery management system</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="metric-card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="ml-4">
                  <p className="metric-label">{metric.name}</p>
                  <p className="metric-value">{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {alerts.some(alert => alert.message.includes('0') === false) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    alert.type === 'error' 
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn btn-primary flex items-center justify-center">
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            New Sale
          </button>
          <button className="btn btn-secondary flex items-center justify-center">
            <CubeIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
          <button className="btn btn-secondary flex items-center justify-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
          <button className="btn btn-secondary flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            System started successfully
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            Database connected
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            AI agents initialized
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
