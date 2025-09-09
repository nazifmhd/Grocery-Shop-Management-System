import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StockUpdateModal } from './StockUpdateModal';

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  current_stock: number;
  reorder_level: number;
  category?: {
    name: string;
  };
  supplier?: {
    name: string;
  };
  barcode?: string;
  image?: string;
  is_active: boolean;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onUpdateStock: (productId: string, quantity: number, movementType: string, notes: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onUpdateStock
}) => {
  const [showStockModal, setShowStockModal] = useState(false);

  const getStockStatus = () => {
    if (product.current_stock <= 0) {
      return { status: 'out', color: 'text-red-800', bgColor: 'bg-red-100', icon: XCircleIcon };
    } else if (product.current_stock <= product.reorder_level) {
      return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-50', icon: ExclamationTriangleIcon };
    } else {
      return { status: 'normal', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircleIcon };
    }
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <div className="product-card">
        {/* Product Image */}
        <div className="mb-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          ) : (
            <div className="product-image bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Price:</span> {formatCurrency(product.price)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Cost:</span> {formatCurrency(product.cost_price)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Margin:</span> {((product.price - product.cost_price) / product.price * 100).toFixed(1)}%
            </p>
          </div>

          {/* Stock Status */}
          <div className={`mt-3 p-2 rounded-md ${stockStatus.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <StatusIcon className={`h-4 w-4 mr-2 ${stockStatus.color}`} />
                <span className={`text-sm font-medium ${stockStatus.color}`}>
                  {product.current_stock} in stock
                </span>
              </div>
              <button
                onClick={() => setShowStockModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Update
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Reorder at: {product.reorder_level}
            </p>
          </div>

          {/* Category and Supplier */}
          <div className="mt-3 space-y-1">
            {product.category && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Category:</span> {product.category.name}
              </p>
            )}
            {product.supplier && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Supplier:</span> {product.supplier.name}
              </p>
            )}
            {product.barcode && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Barcode:</span> {product.barcode}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 btn btn-primary btn-sm flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="btn btn-danger btn-sm"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Stock Actions */}
        <div className="mt-3 flex space-x-1">
          <button
            onClick={() => onUpdateStock(product.id, 1, 'adjustment', 'Quick add')}
            className="flex-1 btn btn-success btn-sm text-xs flex items-center justify-center"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            +1
          </button>
          <button
            onClick={() => onUpdateStock(product.id, -1, 'adjustment', 'Quick remove')}
            className="flex-1 btn btn-warning btn-sm text-xs flex items-center justify-center"
          >
            <MinusIcon className="h-3 w-3 mr-1" />
            -1
          </button>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <StockUpdateModal
          product={product}
          onUpdate={onUpdateStock}
          onClose={() => setShowStockModal(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
