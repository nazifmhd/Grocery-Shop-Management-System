"""
Cash drawer hardware integration
"""

import logging
import serial
import time
from typing import Dict, Any, Optional
import platform

logger = logging.getLogger(__name__)

class CashDrawer:
    """Hardware cash drawer integration"""
    
    def __init__(self, port: str = None, baudrate: int = 9600):
        self.port = port
        self.baudrate = baudrate
        self.connection = None
        self.is_connected = False
        
    def connect(self) -> bool:
        """Connect to cash drawer"""
        try:
            if not self.port:
                # Auto-detect port
                self.port = self._detect_port()
                if not self.port:
                    logger.error("No cash drawer port detected")
                    return False
            
            self.connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=1
            )
            
            if self.connection.is_open:
                self.is_connected = True
                logger.info(f"Connected to cash drawer on {self.port}")
                return True
            else:
                logger.error(f"Failed to open connection to {self.port}")
                return False
                
        except Exception as e:
            logger.error(f"Error connecting to cash drawer: {e}")
            return False
    
    def _detect_port(self) -> Optional[str]:
        """Auto-detect cash drawer port"""
        try:
            if platform.system() == "Windows":
                # Windows COM ports
                for i in range(1, 10):
                    port = f"COM{i}"
                    try:
                        test_conn = serial.Serial(port, self.baudrate, timeout=0.1)
                        test_conn.close()
                        return port
                    except:
                        continue
            else:
                # Linux/Mac USB serial ports
                import glob
                ports = glob.glob("/dev/ttyUSB*") + glob.glob("/dev/ttyACM*")
                for port in ports:
                    try:
                        test_conn = serial.Serial(port, self.baudrate, timeout=0.1)
                        test_conn.close()
                        return port
                    except:
                        continue
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting cash drawer port: {e}")
            return None
    
    def open_drawer(self) -> bool:
        """Open the cash drawer"""
        if not self.is_connected:
            if not self.connect():
                return False
        
        try:
            # ESC/POS command to open cash drawer
            # Different commands for different drawer types
            commands = [
                b'\x1B\x70\x00\x19\xFA',  # ESC p 0 25 250ms
                b'\x1B\x70\x01\x19\xFA',  # ESC p 1 25 250ms
                b'\x07',  # Bell character (some drawers respond to this)
            ]
            
            for command in commands:
                self.connection.write(command)
                time.sleep(0.1)
            
            logger.info("Cash drawer opened")
            return True
            
        except Exception as e:
            logger.error(f"Error opening cash drawer: {e}")
            return False
    
    def close_drawer(self) -> bool:
        """Close the cash drawer (if supported)"""
        if not self.is_connected:
            return False
        
        try:
            # Most cash drawers don't have a close command
            # They close automatically or manually
            logger.info("Cash drawer close command sent (if supported)")
            return True
            
        except Exception as e:
            logger.error(f"Error closing cash drawer: {e}")
            return False
    
    def test_drawer(self) -> bool:
        """Test cash drawer functionality"""
        try:
            if not self.connect():
                return False
            
            # Test open command
            success = self.open_drawer()
            
            if success:
                logger.info("Cash drawer test successful")
                return True
            else:
                logger.error("Cash drawer test failed")
                return False
                
        except Exception as e:
            logger.error(f"Cash drawer test error: {e}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get cash drawer status"""
        return {
            'connected': self.is_connected,
            'port': self.port,
            'baudrate': self.baudrate,
            'status': 'online' if self.is_connected else 'offline'
        }
    
    def disconnect(self):
        """Disconnect from cash drawer"""
        if self.connection and self.connection.is_open:
            self.connection.close()
            self.is_connected = False
            logger.info("Disconnected from cash drawer")

# Global cash drawer instance
drawer_instance = None

def get_cash_drawer() -> CashDrawer:
    """Get global cash drawer instance"""
    global drawer_instance
    if drawer_instance is None:
        drawer_instance = CashDrawer()
    return drawer_instance

def open_cash_drawer() -> bool:
    """Convenience function to open cash drawer"""
    drawer = get_cash_drawer()
    return drawer.open_drawer()
