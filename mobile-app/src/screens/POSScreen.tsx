import React, { useState } from 'react';
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
  TextInput,
  FAB,
  useTheme,
  List,
  Divider,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { api } from '../utils/api';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

const POSScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/inventory/products?${params.toString()}`);
      return response.data;
    }
  });

  // Process transaction mutation
  const processTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await api.post('/sales/transactions', transactionData);
      return response.data;
    },
    onSuccess: () => {
      setCart([]);
      Alert.alert('Success', 'Transaction completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Transaction failed');
    }
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product_id === product.id);
      
      if (existingItem) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      
      return [...prev, {
        id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const processTransaction = () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    
    const transactionData = {
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.total
      })),
      subtotal,
      tax_amount: tax,
      total_amount: total,
      payment_method: 'cash'
    };

    processTransactionMutation.mutate(transactionData);
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Search */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <TextInput
              label="Search products..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              mode="outlined"
              style={styles.searchInput}
            />
          </Card.Content>
        </Card>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.productsGrid}>
            {products.slice(0, 6).map((product: any) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => addToCart(product)}
                style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
              >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                <Text style={styles.productStock}>Stock: {product.current_stock}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cart */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={styles.cardTitle}>Shopping Cart</Title>
            {cart.length === 0 ? (
              <Text style={styles.emptyCart}>Cart is empty</Text>
            ) : (
              <>
                {cart.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} each</Text>
                    </View>
                    <View style={styles.cartItemControls}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                <Divider style={styles.divider} />
                
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax (10%):</Text>
                    <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowFinal]}>
                    <Text style={styles.totalLabelFinal}>Total:</Text>
                    <Text style={styles.totalValueFinal}>${total.toFixed(2)}</Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Scanner' as never)}
          style={styles.actionButton}
        >
          Scan Barcode
        </Button>
        <Button
          mode="contained"
          onPress={processTransaction}
          disabled={cart.length === 0 || processTransactionMutation.isPending}
          style={[styles.actionButton, styles.processButton]}
        >
          Process Sale
        </Button>
      </View>
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
  card: {
    margin: 15,
    elevation: 2,
  },
  searchInput: {
    marginBottom: 10,
  },
  productsContainer: {
    padding: 15,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 3,
  },
  productStock: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  emptyCart: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  divider: {
    marginVertical: 10,
  },
  totalSection: {
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 14,
    color: '#111827',
  },
  totalLabelFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValueFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  processButton: {
    backgroundColor: '#10B981',
  },
});

export default POSScreen;
