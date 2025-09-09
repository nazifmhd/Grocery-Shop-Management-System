import React from 'react';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  barcode?: string;
  image?: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  subtotal: number;
  tax: number;
  total: number;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total
}) => {
  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Cart is empty</p>
            <p className="text-sm">Add products to get started</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)} each
                </p>
                {item.barcode && (
                  <p className="text-xs text-gray-400">
                    Barcode: {item.barcode}
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  ${item.total.toFixed(2)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%):</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
            <span>Total:</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Cart Actions */}
      {items.length > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              items.forEach(item => onRemoveItem(item.id));
            }}
            className="flex-1 btn btn-secondary btn-sm"
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
