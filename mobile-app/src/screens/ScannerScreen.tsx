import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

const ScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // Request camera permission
    // In a real app, you would use expo-camera or react-native-permissions
    setHasPermission(true);
  }, []);

  const handleBarcodeRead = async (event: any) => {
    if (scanned) return;
    
    setScanned(true);
    const barcode = event.data;
    
    try {
      // Search for product by barcode
      const response = await api.get(`/inventory/products/barcode/${barcode}`);
      const product = response.data;
      
      if (product) {
        Alert.alert(
          'Product Found',
          `${product.name}\nPrice: $${product.price}\nStock: ${product.current_stock}`,
          [
            { text: 'Cancel', onPress: () => setScanned(false) },
            { 
              text: 'Add to Cart', 
              onPress: () => {
                // Navigate back to POS with product data
                navigation.goBack();
                // You would pass the product data to the POS screen
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Product Not Found',
          'No product found with this barcode',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to find product',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.auto}
        onBarCodeRead={handleBarcodeRead}
        barCodeTypes={[
          RNCamera.Constants.BarCodeType.qr,
          RNCamera.Constants.BarCodeType.ean13,
          RNCamera.Constants.BarCodeType.ean8,
          RNCamera.Constants.BarCodeType.code128,
          RNCamera.Constants.BarCodeType.code39,
        ]}
      >
        <View style={styles.overlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.instructionText}>
            Point camera at barcode to scan
          </Text>
        </View>
      </RNCamera>
      
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: 'white',
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ScannerScreen;
