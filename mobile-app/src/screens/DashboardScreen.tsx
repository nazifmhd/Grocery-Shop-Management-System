import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  useTheme,
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [salesResponse, inventoryResponse, customersResponse] = await Promise.all([
        api.get('/sales/analytics?period=7d'),
        api.get('/inventory/summary'),
        api.get('/customers/count')
      ]);
      
      return {
        sales: salesResponse.data,
        inventory: inventoryResponse.data,
        customers: customersResponse.data
      };
    }
  });

  const metrics = [
    {
      title: "Today's Revenue",
      value: `$${dashboardData?.sales?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: '💰',
      color: '#10B981',
      screen: 'Sales',
    },
    {
      title: 'Total Transactions',
      value: dashboardData?.sales?.total_transactions?.toString() || '0',
      icon: '🛒',
      color: '#3B82F6',
      screen: 'Sales',
    },
    {
      title: 'Products in Stock',
      value: dashboardData?.inventory?.total_products?.toString() || '0',
      icon: '📦',
      color: '#8B5CF6',
      screen: 'Inventory',
    },
    {
      title: 'Total Customers',
      value: dashboardData?.customers?.total_customers?.toString() || '0',
      icon: '👥',
      color: '#F59E0B',
      screen: 'Customers',
    },
  ];

  const quickActions = [
    {
      title: 'New Sale',
      icon: '🛒',
      screen: 'POS',
      color: '#10B981',
    },
    {
      title: 'Scan Product',
      icon: '📷',
      screen: 'Scanner',
      color: '#3B82F6',
    },
    {
      title: 'Add Product',
      icon: '➕',
      screen: 'Inventory',
      color: '#8B5CF6',
    },
    {
      title: 'View Reports',
      icon: '📊',
      screen: 'Sales',
      color: '#F59E0B',
    },
  ];

  const renderMetricCard = (metric: any, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => navigation.navigate(metric.screen as never)}
      style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}
    >
      <Text style={styles.metricIcon}>{metric.icon}</Text>
      <Text style={[styles.metricValue, { color: metric.color }]}>
        {metric.value}
      </Text>
      <Text style={styles.metricTitle}>{metric.title}</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (action: any, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => navigation.navigate(action.screen as never)}
      style={[styles.actionCard, { backgroundColor: action.color }]}
    >
      <Text style={styles.actionIcon}>{action.icon}</Text>
      <Text style={styles.actionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Dashboard</Title>
          <Paragraph style={styles.headerSubtitle}>
            Welcome to your grocery management system
          </Paragraph>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {metrics.map(renderMetricCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Activity */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Activity</Title>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>✅</Text>
                <Text style={styles.activityText}>System started successfully</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🔗</Text>
                <Text style={styles.activityText}>Database connected</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🤖</Text>
                <Text style={styles.activityText}>AI agents initialized</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('POS' as never)}
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  metricsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metricTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  card: {
    margin: 20,
    marginTop: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  activityText: {
    fontSize: 14,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
