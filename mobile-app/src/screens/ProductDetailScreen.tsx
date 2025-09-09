import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  useTheme,
  Chip,
  Divider,
} from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

const ProductDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute();
  const { product } = route.params as { product: any };

  const getStockStatus = () => {
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

  const stockStatus = getStockStatus();

  return (
    <ScrollView style={styles.container}>
      {/* Product Header */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.productName}>{product.name}</Title>
            <Chip
              style={[styles.stockChip, { backgroundColor: stockStatus.color }]}
              textStyle={styles.stockChipText}
            >
              {stockStatus.label}
            </Chip>
          </View>
          
          <Text style={styles.productPrice}>
            {formatCurrency(product.price)}
          </Text>
          
          {product.description && (
            <Text style={styles.productDescription}>
              {product.description}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Product Details */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Product Details</Title>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product ID:</Text>
            <Text style={styles.detailValue}>{product.id}</Text>
          </View>
          
          {product.barcode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Barcode:</Text>
              <Text style={styles.detailValue}>{product.barcode}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cost Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(product.cost_price)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Selling Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(product.price)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Profit Margin:</Text>
            <Text style={styles.detailValue}>
              {(((product.price - product.cost_price) / product.price) * 100).toFixed(1)}%
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Stock:</Text>
            <Text style={styles.detailValue}>{product.current_stock}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reorder Level:</Text>
            <Text style={styles.detailValue}>{product.reorder_level}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit Type:</Text>
            <Text style={styles.detailValue}>{product.unit_type || 'pieces'}</Text>
          </View>
          
          {product.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{product.category.name}</Text>
            </View>
          )}
          
          {product.supplier && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supplier:</Text>
              <Text style={styles.detailValue}>{product.supplier.name}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Stock Management */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Stock Management</Title>
          
          <View style={styles.stockActions}>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Adjust Stock', 'This would open stock adjustment modal')}
              style={styles.stockButton}
            >
              Adjust Stock
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Reorder', 'This would create a purchase order')}
              style={styles.stockButton}
            >
              Reorder
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => Alert.alert('Edit Product', 'This would open edit product screen')}
          style={styles.actionButton}
        >
          Edit Product
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Delete Product', 'Are you sure you want to delete this product?')}
          style={[styles.actionButton, styles.deleteButton]}
        >
          Delete Product
        </Button>
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },
  stockChip: {
    height: 28,
  },
  stockChipText: {
    fontSize: 12,
    color: 'white',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 15,
  },
  stockActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  stockButton: {
    flex: 1,
  },
  actionsContainer: {
    padding: 15,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
});

export default ProductDetailScreen;
