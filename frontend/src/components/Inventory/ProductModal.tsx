import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  current_stock: number;
  reorder_level: number;
  category_id?: string;
  supplier_id?: string;
  barcode?: string;
  image?: string;
  description?: string;
  unit_type?: string;
  minimum_stock?: number;
  maximum_stock?: number;
  tax_rate?: number;
  discount_percentage?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  onSave: (productData: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  suppliers,
  onSave,
  onClose,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    current_stock: '',
    reorder_level: '',
    minimum_stock: '',
    maximum_stock: '',
    category_id: '',
    supplier_id: '',
    barcode: '',
    unit_type: 'pieces',
    tax_rate: '0',
    discount_percentage: '0'
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        cost_price: product.cost_price?.toString() || '',
        current_stock: product.current_stock?.toString() || '',
        reorder_level: product.reorder_level?.toString() || '',
        minimum_stock: product.minimum_stock?.toString() || '',
        maximum_stock: product.maximum_stock?.toString() || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        barcode: product.barcode || '',
        unit_type: product.unit_type || 'pieces',
        tax_rate: product.tax_rate?.toString() || '0',
        discount_percentage: product.discount_percentage?.toString() || '0'
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price || !formData.cost_price) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert string values to appropriate types
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      cost_price: parseFloat(formData.cost_price),
      current_stock: parseInt(formData.current_stock) || 0,
      reorder_level: parseInt(formData.reorder_level) || 0,
      minimum_stock: parseInt(formData.minimum_stock) || 0,
      maximum_stock: parseInt(formData.maximum_stock) || null,
      tax_rate: parseFloat(formData.tax_rate),
      discount_percentage: parseFloat(formData.discount_percentage),
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null,
      barcode: formData.barcode || null
    };

    onSave(productData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl">
        <div className="modal-header">
          <h3 className="modal-title">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="modal-close">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            </div>

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="md:col-span-2 form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows={3}
              />
            </div>

            {/* Pricing */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing</h4>
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price *</label>
              <input
                type="number"
                step="0.01"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount (%)</label>
              <input
                type="number"
                step="0.01"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Inventory */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Inventory</h4>
            </div>

            <div className="form-group">
              <label className="form-label">Current Stock</label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Stock</label>
              <input
                type="number"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Stock</label>
              <input
                type="number"
                name="maximum_stock"
                value={formData.maximum_stock}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            {/* Classification */}
            <div className="md:col-span-2">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Classification</h4>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Unit Type</label>
              <select
                name="unit_type"
                value={formData.unit_type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="liters">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="boxes">Boxes</option>
                <option value="packs">Packs</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
