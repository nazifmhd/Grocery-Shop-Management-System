import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  current_stock: number;
  reorder_level: number;
  category?: {
    name: string;
  };
}

interface LowStockAlertsProps {
  products: Product[];
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  if (products.length === 0) {
    return null;
  }

  const getAlertLevel = (product: Product) => {
    if (product.current_stock <= 0) {
      return {
        level: 'critical',
        color: 'bg-red-100 border-red-300 text-red-800',
        icon: '🚨'
      };
    } else if (product.current_stock <= product.reorder_level) {
      return {
        level: 'warning',
        color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        icon: '⚠️'
      };
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
        <span className="ml-2 bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded-full">
          {products.length} items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const alert = getAlertLevel(product);
          if (!alert) return null;

          return (
            <div
              key={product.id}
              className={`p-4 rounded-lg border ${alert.color}`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{alert.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm mt-1">
                    Current: <span className="font-semibold">{product.current_stock}</span> | 
                    Reorder at: <span className="font-semibold">{product.reorder_level}</span>
                  </p>
                  {product.category && (
                    <p className="text-xs mt-1 opacity-75">
                      Category: {product.category.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length > 6 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Showing first 6 items. Check inventory page for complete list.
          </p>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
