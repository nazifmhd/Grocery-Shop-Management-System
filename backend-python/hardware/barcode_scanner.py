"""
Barcode scanner hardware integration
"""

import cv2
import numpy as np
from pyzbar import pyzbar
import logging
from typing import Optional, List, Dict, Any
import threading
import time

logger = logging.getLogger(__name__)

class BarcodeScanner:
    """Hardware barcode scanner integration"""
    
    def __init__(self, camera_index: int = 0):
        self.camera_index = camera_index
        self.camera = None
        self.is_scanning = False
        self.scan_callback = None
        self.scan_thread = None
        
    def initialize_camera(self) -> bool:
        """Initialize camera for barcode scanning"""
        try:
            self.camera = cv2.VideoCapture(self.camera_index)
            if not self.camera.isOpened():
                logger.error(f"Failed to open camera {self.camera_index}")
                return False
            
            # Set camera properties
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.camera.set(cv2.CAP_PROP_FPS, 30)
            
            logger.info(f"Camera {self.camera_index} initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing camera: {e}")
            return False
    
    def start_scanning(self, callback: callable) -> bool:
        """Start barcode scanning in a separate thread"""
        if self.is_scanning:
            logger.warning("Scanner is already running")
            return False
        
        if not self.camera:
            if not self.initialize_camera():
                return False
        
        self.scan_callback = callback
        self.is_scanning = True
        self.scan_thread = threading.Thread(target=self._scan_loop)
        self.scan_thread.daemon = True
        self.scan_thread.start()
        
        logger.info("Barcode scanning started")
        return True
    
    def stop_scanning(self):
        """Stop barcode scanning"""
        self.is_scanning = False
        if self.scan_thread:
            self.scan_thread.join(timeout=1)
        
        if self.camera:
            self.camera.release()
            self.camera = None
        
        logger.info("Barcode scanning stopped")
    
    def _scan_loop(self):
        """Main scanning loop"""
        while self.is_scanning and self.camera:
            try:
                ret, frame = self.camera.read()
                if not ret:
                    logger.warning("Failed to read frame from camera")
                    continue
                
                # Convert frame to grayscale for better barcode detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Detect barcodes
                barcodes = pyzbar.decode(gray)
                
                for barcode in barcodes:
                    if not self.is_scanning:
                        break
                    
                    # Extract barcode data
                    barcode_data = barcode.data.decode('utf-8')
                    barcode_type = barcode.type
                    
                    # Get barcode location
                    (x, y, w, h) = barcode.rect
                    
                    logger.info(f"Barcode detected: {barcode_data} (Type: {barcode_type})")
                    
                    # Call callback with barcode data
                    if self.scan_callback:
                        self.scan_callback({
                            'data': barcode_data,
                            'type': barcode_type,
                            'location': {'x': x, 'y': y, 'width': w, 'height': h}
                        })
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                logger.error(f"Error in scan loop: {e}")
                time.sleep(0.1)
    
    def scan_single(self) -> Optional[Dict[str, Any]]:
        """Scan a single barcode and return result"""
        if not self.camera:
            if not self.initialize_camera():
                return None
        
        try:
            ret, frame = self.camera.read()
            if not ret:
                return None
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            barcodes = pyzbar.decode(gray)
            
            if barcodes:
                barcode = barcodes[0]
                return {
                    'data': barcode.data.decode('utf-8'),
                    'type': barcode.type,
                    'location': barcode.rect
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error scanning single barcode: {e}")
            return None
    
    def get_supported_formats(self) -> List[str]:
        """Get list of supported barcode formats"""
        return [
            'CODE128',
            'CODE39',
            'EAN13',
            'EAN8',
            'UPC_A',
            'UPC_E',
            'QRCODE',
            'DATAMATRIX',
            'PDF417',
            'CODABAR',
            'I25'
        ]
    
    def test_scanner(self) -> Dict[str, Any]:
        """Test scanner functionality"""
        try:
            if not self.initialize_camera():
                return {
                    'status': 'error',
                    'message': 'Failed to initialize camera'
                }
            
            # Test camera capture
            ret, frame = self.camera.read()
            if not ret:
                return {
                    'status': 'error',
                    'message': 'Failed to capture frame from camera'
                }
            
            return {
                'status': 'success',
                'message': 'Scanner is working properly',
                'camera_resolution': f"{int(self.camera.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(self.camera.get(cv2.CAP_PROP_FRAME_HEIGHT))}",
                'fps': self.camera.get(cv2.CAP_PROP_FPS),
                'supported_formats': self.get_supported_formats()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Scanner test failed: {str(e)}'
            }
        finally:
            if self.camera:
                self.camera.release()
                self.camera = None

# Global scanner instance
scanner_instance = None

def get_scanner() -> BarcodeScanner:
    """Get global scanner instance"""
    global scanner_instance
    if scanner_instance is None:
        scanner_instance = BarcodeScanner()
    return scanner_instance

def scan_barcode() -> Optional[str]:
    """Convenience function to scan a single barcode"""
    scanner = get_scanner()
    result = scanner.scan_single()
    return result['data'] if result else None
