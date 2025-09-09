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
  Avatar,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

const CustomerScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers
  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return '#F59E0B';
      case 'wholesale':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const renderCustomerCard = (customer: any) => (
    <TouchableOpacity
      key={customer.id}
      style={[styles.customerCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.customerHeader}>
        <Avatar.Text
          size={50}
          label={getInitials(customer.first_name, customer.last_name)}
          style={styles.avatar}
        />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>
            {customer.first_name} {customer.last_name}
          </Text>
          <Text style={styles.customerEmail}>{customer.email}</Text>
          {customer.phone && (
            <Text style={styles.customerPhone}>{customer.phone}</Text>
          )}
        </View>
        {customer.customer_type && customer.customer_type !== 'regular' && (
          <Chip
            style={[
              styles.typeChip,
              { backgroundColor: getCustomerTypeColor(customer.customer_type) }
            ]}
            textStyle={styles.typeChipText}
          >
            {customer.customer_type}
          </Chip>
        )}
      </View>
      
      <View style={styles.customerDetails}>
        {customer.loyalty_points > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loyalty Points:</Text>
            <Text style={styles.detailValue}>{customer.loyalty_points}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Purchases:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(customer.total_purchases || 0)}
          </Text>
        </View>
        
        {customer.last_purchase_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Purchase:</Text>
            <Text style={styles.detailValue}>
              {new Date(customer.last_purchase_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Customer Summary */}
        {customerSummary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Customer Summary</Text>
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {customerSummary.total_customers || 0}
                </Text>
                <Text style={styles.metricLabel}>Total Customers</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {customerSummary.active_customers || 0}
                </Text>
                <Text style={styles.metricLabel}>Active</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {customerSummary.new_customers || 0}
                </Text>
                <Text style={styles.metricLabel}>New This Month</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.metricValue}>
                  {formatCurrency(customerSummary.total_revenue || 0)}
                </Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search customers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Customers List */}
        <View style={styles.customersContainer}>
          <Text style={styles.sectionTitle}>Customers</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading customers...</Text>
            </View>
          ) : customers.length > 0 ? (
            <View style={styles.customersList}>
              {customers.map(renderCustomerCard)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or add a new customer
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
          // Navigate to add customer screen
          Alert.alert('Add Customer', 'This would open the add customer screen');
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
  customersContainer: {
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
  customersList: {
    gap: 15,
  },
  customerCard: {
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    marginRight: 15,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  typeChip: {
    height: 24,
  },
  typeChipText: {
    fontSize: 10,
    color: 'white',
  },
  customerDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
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

export default CustomerScreen;
