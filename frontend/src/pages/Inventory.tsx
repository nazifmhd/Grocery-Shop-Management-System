import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ProductCard } from '../components/Inventory/ProductCard';
import { ProductModal } from '../components/Inventory/ProductModal';
import { LowStockAlerts } from '../components/Inventory/LowStockAlerts';
import { StockLevelChart } from '../components/Inventory/StockLevelChart';
import { api } from '../utils/api';

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

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, stockFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (stockFilter !== 'all') params.append('stock_filter', stockFilter);
      
      const response = await api.get(`/inventory/products?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/inventory/categories');
      return response.data;
    }
  });

  // Fetch low stock products
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const response = await api.get('/inventory/products/low-stock');
      return response.data;
    }
  });

  // Fetch inventory summary
  const { data: inventorySummary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: async () => {
      const response = await api.get('/inventory/summary');
      return response.data;
    }
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (editingProduct) {
        const response = await api.put(`/inventory/products/${editingProduct.id}`, productData);
        return response.data;
      } else {
        const response = await api.post('/inventory/products', productData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      setShowProductModal(false);
      setEditingProduct(null);
      toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/inventory/products/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, quantity, movementType, notes }: any) => {
      const response = await api.post(`/inventory/products/${productId}/stock`, {
        quantity,
        movement_type: movementType,
        notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Stock updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleUpdateStock = (productId: string, quantity: number, movementType: string, notes: string) => {
    updateStockMutation.mutate({ productId, quantity, movementType, notes });
  };

  const filteredProducts = products.filter((product: Product) => {
    if (stockFilter === 'low') {
      return product.current_stock <= product.reorder_level;
    } else if (stockFilter === 'out') {
      return product.current_stock <= 0;
    } else if (stockFilter === 'normal') {
      return product.current_stock > product.reorder_level;
    }
    return true;
  });

  return (
    <div className="inventory-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={handleCreateProduct}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <LowStockAlerts products={lowStockProducts} />
      )}

      {/* Inventory Summary */}
      {inventorySummary && (
        <div className="metrics-grid mb-6">
          <div className="metric-card">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{inventorySummary.total_products}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Low Stock Items</div>
            <div className="metric-value text-red-600">{inventorySummary.low_stock_count}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Out of Stock</div>
            <div className="metric-value text-red-800">{inventorySummary.out_of_stock_count}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total Value</div>
            <div className="metric-value">${inventorySummary.total_inventory_value.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="normal">Normal Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="inventory-grid">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onUpdateStock={handleUpdateStock}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Stock Level Chart */}
      <div className="mt-8">
        <StockLevelChart products={products} />
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={productMutation.mutate}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          isLoading={productMutation.isPending}
        />
      )}
    </div>
  );
};

export default Inventory;
