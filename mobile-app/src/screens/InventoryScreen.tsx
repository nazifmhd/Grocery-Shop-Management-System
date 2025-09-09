import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Searchbar,
  FAB,
  useTheme,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

const InventoryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products', searchQuery, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filter !== 'all') params.append('stock_filter', filter);
      
      const response = await api.get(`/inventory/products?${params.toString()}`);
      return response.data;
    }
  });

  const getStockStatus = (product: any) => {
    if (product.current_stock <= 0) {
      return { status: 'out', color: '#EF4444', label: 'Out of Stock' };
    } else if (product.current_stock <= product.reorder_level) {
      return { status: 'low', color: '#F59E0B', label: 'Low Stock' };
    } else {
      return { status: 'normal', color: '#10B981', label: 'In Stock' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderProductCard = (product: any) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity
        key={product.id}
        onPress={() => navigation.navigate('ProductDetail' as never, { product })}
        style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Chip
            style={[styles.stockChip, { backgroundColor: stockStatus.color }]}
            textStyle={styles.stockChipText}
          >
            {stockStatus.label}
          </Chip>
        </View>
        
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>
            {formatCurrency(product.price)}
          </Text>
          <Text style={styles.productStock}>
            Stock: {product.current_stock}
          </Text>
        </View>
        
        {product.category && (
          <Text style={styles.productCategory}>
            {product.category.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'low', label: 'Low Stock' },
    { key: 'out', label: 'Out of Stock' },
    { key: 'normal', label: 'Normal' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search products..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filterItem) => (
              <TouchableOpacity
                key={filterItem.key}
                onPress={() => setFilter(filterItem.key)}
                style={[
                  styles.filterChip,
                  filter === filterItem.key && styles.filterChipActive
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === filterItem.key && styles.filterChipTextActive
                  ]}
                >
                  {filterItem.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          {products.length > 0 ? (
            <View style={styles.productsGrid}>
              {products.map(renderProductCard)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          // Navigate to add product screen
          Alert.alert('Add Product', 'This would open the add product screen');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    padding: 15,
  },
  searchBar: {
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: 'white',
  },
  productsContainer: {
    padding: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  stockChip: {
    height: 24,
  },
  stockChipText: {
    fontSize: 10,
    color: 'white',
  },
  productDetails: {
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#6B7280',
  },
  productCategory: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default InventoryScreen;
