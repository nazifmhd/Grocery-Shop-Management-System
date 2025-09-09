import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  useTheme,
  Chip,
  Divider,
  List,
} from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

const TransactionDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute();
  const { transaction } = route.params as { transaction: any };

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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'mobile':
        return '📱';
      case 'loyalty_points':
        return '⭐';
      default:
        return '💰';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Transaction Header */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.transactionNumber}>
              #{transaction.transaction_number}
            </Title>
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
          
          <Text style={styles.transactionAmount}>
            {formatCurrency(transaction.total_amount)}
          </Text>
        </Card.Content>
      </Card>

      {/* Payment Information */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Payment Information</Title>
          
          <View style={styles.paymentInfo}>
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentIcon}>
                {getPaymentMethodIcon(transaction.payment_method)}
              </Text>
              <Text style={styles.paymentMethodText}>
                {transaction.payment_method?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            
            {transaction.pos_terminal_id && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Terminal ID:</Text>
                <Text style={styles.detailValue}>{transaction.pos_terminal_id}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Transaction Items */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Items ({transaction.items?.length || 0})</Title>
          
          {transaction.items && transaction.items.length > 0 ? (
            <View style={styles.itemsList}>
              {transaction.items.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {formatCurrency(item.line_total)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noItems}>No items found</Text>
          )}
        </Card.Content>
      </Card>

      {/* Transaction Summary */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Transaction Summary</Title>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(transaction.subtotal)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (10%):</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(transaction.tax_amount)}
            </Text>
          </View>
          
          {transaction.discount_amount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>
                -{formatCurrency(transaction.discount_amount)}
              </Text>
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelFinal}>Total:</Text>
            <Text style={styles.summaryValueFinal}>
              {formatCurrency(transaction.total_amount)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Customer Information */}
      {transaction.customer && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Customer Information</Title>
            
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {transaction.customer.first_name} {transaction.customer.last_name}
              </Text>
              <Text style={styles.customerEmail}>{transaction.customer.email}</Text>
              {transaction.customer.phone && (
                <Text style={styles.customerPhone}>{transaction.customer.phone}</Text>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            // Print receipt functionality
          }}
        >
          <Text style={styles.actionButtonText}>Print Receipt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
          onPress={() => {
            // Process return functionality
          }}
        >
          <Text style={styles.actionButtonText}>Process Return</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  card: {
    margin: 15,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    color: 'white',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  transactionAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  paymentInfo: {
    gap: 10,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  noItems: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  summaryLabelFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryValueFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  divider: {
    marginVertical: 10,
  },
  customerInfo: {
    gap: 5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    padding: 15,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionDetailScreen;
