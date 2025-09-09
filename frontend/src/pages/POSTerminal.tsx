import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  MinusIcon, 
  TrashIcon, 
  QrCodeIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { BarcodeScanner } from '../components/POS/BarcodeScanner';
import { ProductSearch } from '../components/POS/ProductSearch';
import { ShoppingCart } from '../components/POS/ShoppingCart';
import { PaymentProcessor } from '../components/POS/PaymentProcessor';
import { Receipt } from '../components/POS/Receipt';
import { api } from '../utils/api';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  barcode?: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  image?: string;
  stock: number;
}

const POSTerminal: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const queryClient = useQueryClient();

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Add product to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        return prev.map(item => 
          item.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
            : item
        );
      }
      
      return [...prev, {
        id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
        barcode: product.barcode,
        image: product.image
      }];
    });
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, quantity: number) => {
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

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCustomer(null);
  };

  // Process transaction
  const processTransactionMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post('/sales/transactions', {
        customer_id: customer?.id,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.total
        })),
        subtotal,
        tax_amount: tax,
        total_amount: total,
        payment_method: paymentData.method,
        payment_data: paymentData
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentTransaction(data);
      setShowReceipt(true);
      clearCart();
      toast.success('Transaction completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  });

  // Handle payment
  const handlePayment = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      await processTransactionMutation.mutateAsync(paymentData);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle barcode scan
  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const response = await api.get(`/inventory/products/barcode/${barcode}`);
      const product = response.data;
      
      if (product) {
        addToCart(product, 1);
        toast.success(`Added ${product.name} to cart`);
      } else {
        toast.error('Product not found');
      }
    } catch (error: any) {
      toast.error('Failed to find product');
    }
  };

  // Handle product search
  const handleProductSelect = (product: Product) => {
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart`);
  };

  // Print receipt
  const printReceipt = () => {
    window.print();
  };

  // Close receipt
  const closeReceipt = () => {
    setShowReceipt(false);
    setCurrentTransaction(null);
  };

  return (
    <div className="pos-terminal">
      {showReceipt && currentTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <Receipt 
              transaction={currentTransaction}
              onPrint={printReceipt}
              onClose={closeReceipt}
            />
          </div>
        </div>
      )}

      <div className="pos-grid">
        {/* Left Panel - Scanner and Product Search */}
        <div className="pos-left-panel">
          {/* Barcode Scanner */}
          <div className="scanner-section">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <QrCodeIcon className="h-5 w-5 mr-2" />
              Barcode Scanner
            </h3>
            <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
          </div>

          {/* Product Search */}
          <div className="product-search">
            <h3 className="text-lg font-semibold mb-4">Product Search</h3>
            <ProductSearch onProductSelect={handleProductSelect} />
          </div>
        </div>

        {/* Right Panel - Cart and Payment */}
        <div className="pos-right-panel">
          {/* Shopping Cart */}
          <div className="shopping-cart">
            <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
            <ShoppingCart 
              items={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <h3 className="text-lg font-semibold mb-4">Payment</h3>
            <PaymentProcessor 
              total={total}
              onPayment={handlePayment}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSTerminal;
