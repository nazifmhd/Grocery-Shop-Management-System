import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { api } from '../../utils/api';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  image?: string;
  stock: number;
  category?: string;
}

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await api.get(`/inventory/products?${params.toString()}`);
      return response.data;
    },
    enabled: searchTerm.length >= 2 || selectedCategory !== ''
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/inventory/categories');
      return response.data;
    }
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length >= 2);
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setShowResults(value !== '');
  };

  // Handle product selection
  const handleProductClick = (product: Product) => {
    onProductSelect(product);
    setSearchTerm('');
    setShowResults(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products by name or barcode..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="form-input pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-600">×</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="form-select"
        >
          <option value="">All Categories</option>
          {categories.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-2 text-gray-500">Searching...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {products.map((product: Product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {product.stock} | {product.category}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="btn btn-primary btn-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No products found</p>
              <p className="text-sm">Try a different search term or category</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSearchTerm('milk')}
          className="btn btn-secondary btn-sm"
        >
          Quick: Milk
        </button>
        <button
          onClick={() => setSearchTerm('bread')}
          className="btn btn-secondary btn-sm"
        >
          Quick: Bread
        </button>
        <button
          onClick={() => setSearchTerm('eggs')}
          className="btn btn-secondary btn-sm"
        >
          Quick: Eggs
        </button>
        <button
          onClick={() => setSearchTerm('banana')}
          className="btn btn-secondary btn-sm"
        >
          Quick: Banana
        </button>
      </div>
    </div>
  );
};

export default ProductSearch;
