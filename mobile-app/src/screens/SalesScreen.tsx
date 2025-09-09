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
  useTheme,
  Chip,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

const SalesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch sales data
  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ['sales-analytics', '7d'],
    queryFn: async () => {
      const response = await api.get('/sales/analytics?period=7d');
      return response.data;
    }
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: isTransactionsLoading, refetch } = useQuery({
    queryKey: ['transactions', searchQuery, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filter !== 'all') params.append('status', filter);
      
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
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderTransactionItem = (transaction: any) => (
    <TouchableOpacity
      key={transaction.id}
      onPress={() => navigation.navigate('TransactionDetail' as never, { transaction })}
      style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionNumber}>
          #{transaction.transaction_number}
        </Text>
        <Chip
          style={[styles.statusChip, { backgroundColor: getStatusColor(transaction.payment_status) }]}
          textStyle={styles.statusChipText}
        >
          {transaction.payment_status}
        </Chip>
      </View>
      
      <Text style={styles.transactionDate}>
        {formatDate(transaction.transaction_date)}
      </Text>
      
      <View style={styles.transactionFooter}>
        <Text style={styles.transactionAmount}>
          {formatCurrency(transaction.total_amount)}
        </Text>
        <Text style={styles.transactionMethod}>
          {transaction.payment_method}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const isLoading = isSalesLoading || isTransactionsLoading;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Sales Summary */}
        {salesData && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Sales Summary</Text>
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {formatCurrency(salesData.total_revenue || 0)}
                </Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {salesData.total_transactions || 0}
                </Text>
                <Text style={styles.metricLabel}>Transactions</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {formatCurrency(salesData.average_transaction_value || 0)}
                </Text>
                <Text style={styles.metricLabel}>Avg. Transaction</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {salesData.total_items_sold || 0}
                </Text>
                <Text style={styles.metricLabel}>Items Sold</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search transactions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

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

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.map(renderTransactionItem)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  summaryContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 15,
    paddingTop: 0,
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
  transactionsContainer: {
    padding: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  transactionsList: {
    gap: 10,
  },
  transactionItem: {
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    color: 'white',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  transactionMethod: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
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
});

export default SalesScreen;
