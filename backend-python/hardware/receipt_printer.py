"""
Receipt printer hardware integration
"""

import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import subprocess
import platform

logger = logging.getLogger(__name__)

class ReceiptPrinter:
    """Hardware receipt printer integration"""
    
    def __init__(self, printer_name: str = None, printer_ip: str = None):
        self.printer_name = printer_name
        self.printer_ip = printer_ip
        self.is_connected = False
        
    def connect(self) -> bool:
        """Connect to the receipt printer"""
        try:
            if self.printer_ip:
                # Network printer
                return self._connect_network_printer()
            elif self.printer_name:
                # USB/Serial printer
                return self._connect_usb_printer()
            else:
                # Default printer
                return self._connect_default_printer()
                
        except Exception as e:
            logger.error(f"Error connecting to printer: {e}")
            return False
    
    def _connect_network_printer(self) -> bool:
        """Connect to network printer"""
        try:
            # Test network connectivity
            if platform.system() == "Windows":
                result = subprocess.run(
                    ["ping", "-n", "1", self.printer_ip],
                    capture_output=True,
                    text=True
                )
            else:
                result = subprocess.run(
                    ["ping", "-c", "1", self.printer_ip],
                    capture_output=True,
                    text=True
                )
            
            if result.returncode == 0:
                self.is_connected = True
                logger.info(f"Connected to network printer at {self.printer_ip}")
                return True
            else:
                logger.error(f"Failed to ping printer at {self.printer_ip}")
                return False
                
        except Exception as e:
            logger.error(f"Error connecting to network printer: {e}")
            return False
    
    def _connect_usb_printer(self) -> bool:
        """Connect to USB printer"""
        try:
            # Check if printer is available
            if platform.system() == "Windows":
                result = subprocess.run(
                    ["wmic", "printer", "where", f"name='{self.printer_name}'", "get", "name"],
                    capture_output=True,
                    text=True
                )
                if self.printer_name in result.stdout:
                    self.is_connected = True
                    logger.info(f"Connected to USB printer: {self.printer_name}")
                    return True
            else:
                # Linux/Mac - check if printer exists
                result = subprocess.run(
                    ["lpstat", "-p", self.printer_name],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    self.is_connected = True
                    logger.info(f"Connected to USB printer: {self.printer_name}")
                    return True
            
            logger.error(f"Printer {self.printer_name} not found")
            return False
            
        except Exception as e:
            logger.error(f"Error connecting to USB printer: {e}")
            return False
    
    def _connect_default_printer(self) -> bool:
        """Connect to default system printer"""
        try:
            if platform.system() == "Windows":
                result = subprocess.run(
                    ["wmic", "printer", "where", "default='true'", "get", "name"],
                    capture_output=True,
                    text=True
                )
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    self.printer_name = lines[1].strip()
                    self.is_connected = True
                    logger.info(f"Connected to default printer: {self.printer_name}")
                    return True
            else:
                result = subprocess.run(
                    ["lpstat", "-d"],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    self.is_connected = True
                    logger.info("Connected to default printer")
                    return True
            
            logger.error("No default printer found")
            return False
            
        except Exception as e:
            logger.error(f"Error connecting to default printer: {e}")
            return False
    
    def print_receipt(self, receipt_data: Dict[str, Any]) -> bool:
        """Print a receipt"""
        if not self.is_connected:
            if not self.connect():
                return False
        
        try:
            # Generate receipt content
            receipt_content = self._generate_receipt_content(receipt_data)
            
            # Print the receipt
            if self.printer_ip:
                return self._print_network(receipt_content)
            else:
                return self._print_local(receipt_content)
                
        except Exception as e:
            logger.error(f"Error printing receipt: {e}")
            return False
    
    def _generate_receipt_content(self, receipt_data: Dict[str, Any]) -> str:
        """Generate receipt content in ESC/POS format"""
        content = []
        
        # Header
        content.append("ESC @")  # Initialize printer
        content.append("ESC a 1")  # Center align
        content.append("ESC ! 8")  # Double height, double width
        content.append(f"🛒 {receipt_data.get('store_name', 'GROCERY STORE')}")
        content.append("ESC ! 0")  # Normal text
        content.append("ESC a 0")  # Left align
        
        # Store info
        content.append(f"{receipt_data.get('store_address', '123 Main Street')}")
        content.append(f"{receipt_data.get('store_city', 'City, State 12345')}")
        content.append(f"Phone: {receipt_data.get('store_phone', '(555) 123-4567')}")
        content.append("")
        
        # Transaction info
        content.append("ESC a 1")  # Center align
        content.append(f"Receipt #{receipt_data.get('transaction_number', 'N/A')}")
        content.append(f"{receipt_data.get('transaction_date', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))}")
        content.append("ESC a 0")  # Left align
        content.append("ESC ! 1")  # Bold
        content.append("--------------------------------")
        content.append("ESC ! 0")  # Normal text
        
        # Items
        items = receipt_data.get('items', [])
        for item in items:
            content.append(f"{item.get('name', 'Item')}")
            content.append(f"  {item.get('quantity', 1)} x ${item.get('unit_price', 0):.2f} = ${item.get('line_total', 0):.2f}")
        
        content.append("ESC ! 1")  # Bold
        content.append("--------------------------------")
        content.append("ESC ! 0")  # Normal text
        
        # Totals
        content.append(f"Subtotal: ${receipt_data.get('subtotal', 0):.2f}")
        content.append(f"Tax: ${receipt_data.get('tax_amount', 0):.2f}")
        if receipt_data.get('discount_amount', 0) > 0:
            content.append(f"Discount: -${receipt_data.get('discount_amount', 0):.2f}")
        content.append("ESC ! 1")  # Bold
        content.append(f"TOTAL: ${receipt_data.get('total_amount', 0):.2f}")
        content.append("ESC ! 0")  # Normal text
        
        # Payment info
        content.append(f"Payment: {receipt_data.get('payment_method', 'Cash')}")
        content.append("")
        
        # Footer
        content.append("ESC a 1")  # Center align
        content.append("Thank you for your business!")
        content.append("Please come again")
        content.append("")
        content.append("ESC ! 1")  # Bold
        content.append("Return Policy: 30 days with receipt")
        content.append("Questions? Call (555) 123-4567")
        content.append("ESC ! 0")  # Normal text
        
        # Cut paper
        content.append("ESC d 3")  # Cut paper (3 lines)
        
        return "\n".join(content)
    
    def _print_network(self, content: str) -> bool:
        """Print to network printer"""
        try:
            # Save content to temporary file
            temp_file = f"/tmp/receipt_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(temp_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Send to network printer
            if platform.system() == "Windows":
                result = subprocess.run(
                    ["net", "use", f"\\\\{self.printer_ip}\\printer"],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    subprocess.run(
                        ["copy", temp_file, f"\\\\{self.printer_ip}\\printer"],
                        capture_output=True
                    )
            else:
                subprocess.run(
                    ["lpr", "-H", self.printer_ip, temp_file],
                    capture_output=True
                )
            
            # Clean up
            os.remove(temp_file)
            return True
            
        except Exception as e:
            logger.error(f"Error printing to network printer: {e}")
            return False
    
    def _print_local(self, content: str) -> bool:
        """Print to local printer"""
        try:
            # Save content to temporary file
            temp_file = f"/tmp/receipt_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(temp_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Print using system print command
            if platform.system() == "Windows":
                subprocess.run(
                    ["notepad", "/p", temp_file],
                    capture_output=True
                )
            else:
                printer_name = self.printer_name or "default"
                subprocess.run(
                    ["lpr", "-P", printer_name, temp_file],
                    capture_output=True
                )
            
            # Clean up
            os.remove(temp_file)
            return True
            
        except Exception as e:
            logger.error(f"Error printing to local printer: {e}")
            return False
    
    def test_printer(self) -> Dict[str, Any]:
        """Test printer functionality"""
        try:
            if not self.connect():
                return {
                    'status': 'error',
                    'message': 'Failed to connect to printer'
                }
            
            # Test print
            test_receipt = {
                'store_name': 'Test Store',
                'store_address': '123 Test Street',
                'store_city': 'Test City, TS 12345',
                'store_phone': '(555) 123-4567',
                'transaction_number': 'TEST-001',
                'transaction_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'items': [
                    {'name': 'Test Item', 'quantity': 1, 'unit_price': 1.00, 'line_total': 1.00}
                ],
                'subtotal': 1.00,
                'tax_amount': 0.10,
                'total_amount': 1.10,
                'payment_method': 'Test'
            }
            
            if self.print_receipt(test_receipt):
                return {
                    'status': 'success',
                    'message': 'Printer test successful',
                    'printer_name': self.printer_name,
                    'printer_ip': self.printer_ip
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Failed to print test receipt'
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Printer test failed: {str(e)}'
            }
    
    def get_printer_status(self) -> Dict[str, Any]:
        """Get printer status"""
        return {
            'connected': self.is_connected,
            'printer_name': self.printer_name,
            'printer_ip': self.printer_ip,
            'status': 'online' if self.is_connected else 'offline'
        }

# Global printer instance
printer_instance = None

def get_printer() -> ReceiptPrinter:
    """Get global printer instance"""
    global printer_instance
    if printer_instance is None:
        printer_instance = ReceiptPrinter()
    return printer_instance

def print_receipt(receipt_data: Dict[str, Any]) -> bool:
    """Convenience function to print a receipt"""
    printer = get_printer()
    return printer.print_receipt(receipt_data)
