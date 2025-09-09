import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import FlashMessage from 'react-native-flash-message';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import POSScreen from './src/screens/POSScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import SalesScreen from './src/screens/SalesScreen';
import CustomerScreen from './src/screens/CustomerScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Theme
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen 
              name="POS" 
              component={POSScreen}
              options={{ title: 'Point of Sale' }}
            />
            <Stack.Screen 
              name="Inventory" 
              component={InventoryScreen}
              options={{ title: 'Inventory' }}
            />
            <Stack.Screen 
              name="Sales" 
              component={SalesScreen}
              options={{ title: 'Sales' }}
            />
            <Stack.Screen 
              name="Customers" 
              component={CustomerScreen}
              options={{ title: 'Customers' }}
            />
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen}
              options={{ title: 'Barcode Scanner' }}
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen}
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen 
              name="TransactionDetail" 
              component={TransactionDetailScreen}
              options={{ title: 'Transaction Details' }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
          <Toast />
          <FlashMessage position="top" />
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
