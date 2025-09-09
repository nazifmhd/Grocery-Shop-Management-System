import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  UserCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/customers?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch customer summary
  const { data: customerSummary } = useQuery({
    queryKey: ['customer-summary'],
    queryFn: async () => {
      const response = await api.get('/customers/summary');
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
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="customer-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <button className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Customer Summary */}
      {customerSummary && (
        <div className="metrics-grid mb-6">
          <div className="metric-card">
            <div className="metric-label">Total Customers</div>
            <div className="metric-value">{customerSummary.total_customers || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active Customers</div>
            <div className="metric-value">{customerSummary.active_customers || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">New This Month</div>
            <div className="metric-value">{customerSummary.new_customers || 0}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">
              {formatCurrency(customerSummary.total_revenue || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="customer-grid">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : customers.length > 0 ? (
          customers.map((customer: any) => (
            <div key={customer.id} className="customer-card">
              {/* Customer Avatar */}
              <div className="flex items-center mb-4">
                <div className="customer-avatar">
                  {getInitials(customer.first_name, customer.last_name)}
                </div>
                <div className="ml-4">
                  <h3 className="customer-name">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <p className="customer-email">{customer.email}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="customer-info">
                {customer.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {customer.phone}
                  </p>
                )}
                
                {customer.customer_type && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> 
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      customer.customer_type === 'premium' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : customer.customer_type === 'wholesale'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.customer_type}
                    </span>
                  </p>
                )}

                {customer.loyalty_points > 0 && (
                  <p className="loyalty-points">
                    <StarIcon className="h-4 w-4 inline mr-1" />
                    {customer.loyalty_points} points
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Purchases:</span> 
                  {formatCurrency(customer.total_purchases || 0)}
                </p>

                {customer.last_purchase_date && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Purchase:</span> 
                    {formatDate(customer.last_purchase_date)}
                  </p>
                )}

                {customer.address && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span> {customer.address}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn btn-primary btn-sm">
                  View Details
                </button>
                <button className="btn btn-secondary btn-sm">
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <UserCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm">Try adjusting your search or add a new customer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
