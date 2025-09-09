import React, { useRef, useEffect, useState } from 'react';
import Quagga from 'quagga';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isScanning && scannerRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        }
      }, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err);
          setError('Failed to initialize barcode scanner');
          return;
        }
        console.log("Quagga initialization finished. Ready to start");
        Quagga.start();
      });

      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        console.log('Barcode detected:', code);
        onBarcodeScanned(code);
        Quagga.stop();
        setIsScanning(false);
      });
    }

    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, [isScanning, onBarcodeScanned]);

  const startScanning = () => {
    setError(null);
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
    Quagga.stop();
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={startScanning}
          disabled={isScanning}
          className="btn btn-primary btn-sm"
        >
          {isScanning ? 'Scanning...' : 'Start Scanner'}
        </button>
        {isScanning && (
          <button
            onClick={stopScanning}
            className="btn btn-secondary btn-sm"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="barcode-scanner">
        <div ref={scannerRef} className="scanner-overlay">
          {!isScanning && (
            <div className="text-center text-white">
              <div className="scanner-frame mx-auto"></div>
              <p className="mt-4">Click "Start Scanner" to begin scanning</p>
            </div>
          )}
        </div>
        {isScanning && (
          <div className="scanner-status">
            <p>Point camera at barcode to scan</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <p>Supported formats: Code 128, EAN, UPC, Code 39, Codabar</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
