import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  current_stock: number;
}

interface StockUpdateModalProps {
  product: Product;
  onUpdate: (productId: string, quantity: number, movementType: string, notes: string) => void;
  onClose: () => void;
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  product,
  onUpdate,
  onClose
}) => {
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState('adjustment');
  const [notes, setNotes] = useState('');

  const movementTypes = [
    { value: 'adjustment', label: 'Stock Adjustment' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'return', label: 'Return' },
    { value: 'waste', label: 'Waste/Damage' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum === 0) {
      alert('Please enter a valid quantity');
      return;
    }

    onUpdate(product.id, quantityNum, movementType, notes);
    onClose();
  };

  const handleQuickAdjust = (amount: number) => {
    setQuantity(amount.toString());
    setMovementType('adjustment');
    setNotes(`Quick ${amount > 0 ? 'add' : 'remove'} ${Math.abs(amount)} units`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-md">
        <div className="modal-header">
          <h3 className="modal-title">Update Stock - {product.name}</h3>
          <button onClick={onClose} className="modal-close">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Current Stock Display */}
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="text-lg font-semibold">{product.current_stock} units</p>
          </div>

          {/* Quick Adjustments */}
          <div className="mb-4">
            <label className="form-label">Quick Adjustments</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdjust(1)}
                className="btn btn-success btn-sm"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-1)}
                className="btn btn-warning btn-sm"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(5)}
                className="btn btn-success btn-sm"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-5)}
                className="btn btn-warning btn-sm"
              >
                -5
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="form-group">
            <label className="form-label">Quantity Change</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="form-input"
              placeholder="Enter quantity (positive to add, negative to remove)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Positive numbers add stock, negative numbers remove stock
            </p>
          </div>

          {/* Movement Type */}
          <div className="form-group">
            <label className="form-label">Movement Type</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="form-select"
            >
              {movementTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Add notes about this stock change..."
            />
          </div>

          {/* Preview */}
          {quantity && (
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <p className="text-sm font-medium text-blue-900">Preview:</p>
              <p className="text-sm text-blue-700">
                Current: {product.current_stock} → New: {product.current_stock + parseInt(quantity || '0')}
              </p>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
