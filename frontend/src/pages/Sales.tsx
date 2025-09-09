import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';

const Sales: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch sales data
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales', dateFilter, statusFilter],
    queryFn: async () => {
      const response = await api.get(`/sales/analytics?period=${dateFilter}`);
      return response.data;
    }
  });

  // Fetch recent transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await api.get(`/sales/transactions?${params.toString()}`);
      return response.data;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="sales-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
      </div>

      {/* Sales Summary */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">
            {formatCurrency(salesData?.total_revenue || 0)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Transactions</div>
          <div className="metric-value">{salesData?.total_transactions || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Average Transaction</div>
          <div className="metric-value">
            {formatCurrency(salesData?.average_transaction_value || 0)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Items Sold</div>
          <div className="metric-value">{salesData?.total_items_sold || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="btn btn-secondary">
            Export Data
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        
        <div className="transaction-list">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction: any) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-header">
                  <div>
                    <p className="transaction-number">
                      #{transaction.transaction_number}
                    </p>
                    <p className="transaction-date">
                      {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="transaction-amount">
                      {formatCurrency(transaction.total_amount)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.payment_status)}`}>
                      {transaction.payment_status}
                    </span>
                  </div>
                </div>
                
                {transaction.items && transaction.items.length > 0 && (
                  <div className="transaction-items">
                    {transaction.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="transaction-item-row">
                        <span>{item.name}</span>
                        <span>Qty: {item.quantity} × {formatCurrency(item.unit_price)}</span>
                      </div>
                    ))}
                    {transaction.items.length > 3 && (
                      <div className="transaction-item-row text-gray-500">
                        <span>... and {transaction.items.length - 3} more items</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;
