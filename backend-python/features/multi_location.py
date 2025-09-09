"""
Multi-location support for grocery management system
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from datetime import datetime
import logging

from models import Product, StockMovement, SalesTransaction, Staff, Location
from .base_service import BaseService

logger = logging.getLogger(__name__)

class MultiLocationService(BaseService):
    """Service for multi-location management"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def get_all_locations(self) -> List[Location]:
        """Get all locations"""
        return self.db.query(Location).filter(Location.is_active == True).all()
    
    def get_location_by_id(self, location_id: str) -> Optional[Location]:
        """Get location by ID"""
        return self.db.query(Location).filter(Location.id == location_id).first()
    
    def create_location(self, location_data: Dict[str, Any]) -> Location:
        """Create a new location"""
        location = Location(**location_data)
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        return location
    
    def update_location(self, location_id: str, location_data: Dict[str, Any]) -> Optional[Location]:
        """Update location information"""
        location = self.get_location_by_id(location_id)
        if location:
            for key, value in location_data.items():
                setattr(location, key, value)
            location.updated_at = datetime.now()
            self.db.commit()
            self.db.refresh(location)
        return location
    
    def get_location_inventory(self, location_id: str) -> List[Dict[str, Any]]:
        """Get inventory for a specific location"""
        products = self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.location_id == location_id
            )
        ).all()
        
        inventory = []
        for product in products:
            inventory.append({
                'product_id': str(product.id),
                'name': product.name,
                'current_stock': product.current_stock,
                'reorder_level': product.reorder_level,
                'location': product.location.name if product.location else None
            })
        
        return inventory
    
    def transfer_inventory(self, from_location_id: str, to_location_id: str, 
                          product_id: str, quantity: int, notes: str = None) -> bool:
        """Transfer inventory between locations"""
        try:
            # Check if source location has enough stock
            product = self.db.query(Product).filter(
                and_(
                    Product.id == product_id,
                    Product.location_id == from_location_id
                )
            ).first()
            
            if not product:
                logger.error(f"Product {product_id} not found in source location {from_location_id}")
                return False
            
            if product.current_stock < quantity:
                logger.error(f"Insufficient stock for transfer. Available: {product.current_stock}, Requested: {quantity}")
                return False
            
            # Create outgoing movement
            outgoing_movement = StockMovement(
                product_id=product_id,
                movement_type='transfer_out',
                quantity=-quantity,
                unit_cost=product.cost_price,
                total_cost=product.cost_price * quantity,
                reference_id=to_location_id,
                notes=f"Transfer to {to_location_id}. {notes or ''}"
            )
            self.db.add(outgoing_movement)
            
            # Update source location stock
            product.current_stock -= quantity
            
            # Create incoming movement
            incoming_movement = StockMovement(
                product_id=product_id,
                movement_type='transfer_in',
                quantity=quantity,
                unit_cost=product.cost_price,
                total_cost=product.cost_price * quantity,
                reference_id=from_location_id,
                notes=f"Transfer from {from_location_id}. {notes or ''}"
            )
            self.db.add(incoming_movement)
            
            # Update destination location stock
            dest_product = self.db.query(Product).filter(
                and_(
                    Product.id == product_id,
                    Product.location_id == to_location_id
                )
            ).first()
            
            if dest_product:
                dest_product.current_stock += quantity
            else:
                # Create new product entry for destination location
                new_product = Product(
                    id=product.id,
                    name=product.name,
                    description=product.description,
                    category_id=product.category_id,
                    supplier_id=product.supplier_id,
                    cost_price=product.cost_price,
                    selling_price=product.selling_price,
                    current_stock=quantity,
                    reorder_level=product.reorder_level,
                    location_id=to_location_id,
                    barcode=product.barcode,
                    unit_type=product.unit_type,
                    is_active=True
                )
                self.db.add(new_product)
            
            self.db.commit()
            logger.info(f"Successfully transferred {quantity} units of {product.name} from {from_location_id} to {to_location_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error transferring inventory: {e}")
            self.db.rollback()
            return False
    
    def get_location_sales_summary(self, location_id: str, start_date: datetime, 
                                 end_date: datetime) -> Dict[str, Any]:
        """Get sales summary for a specific location"""
        transactions = self.db.query(SalesTransaction).filter(
            and_(
                SalesTransaction.location_id == location_id,
                SalesTransaction.transaction_date >= start_date,
                SalesTransaction.transaction_date <= end_date,
                SalesTransaction.is_return == False
            )
        ).all()
        
        total_revenue = sum(t.total_amount for t in transactions)
        total_transactions = len(transactions)
        average_transaction_value = total_revenue / total_transactions if total_transactions > 0 else 0
        
        return {
            'location_id': location_id,
            'total_revenue': float(total_revenue),
            'total_transactions': total_transactions,
            'average_transaction_value': float(average_transaction_value),
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }
    
    def get_cross_location_analytics(self) -> Dict[str, Any]:
        """Get analytics across all locations"""
        locations = self.get_all_locations()
        analytics = {
            'total_locations': len(locations),
            'location_performance': [],
            'inventory_distribution': {},
            'sales_comparison': {}
        }
        
        for location in locations:
            # Get recent sales data
            recent_sales = self.get_location_sales_summary(
                str(location.id),
                datetime.now().replace(day=1),  # First day of current month
                datetime.now()
            )
            
            analytics['location_performance'].append({
                'location_id': str(location.id),
                'location_name': location.name,
                'revenue': recent_sales['total_revenue'],
                'transactions': recent_sales['total_transactions']
            })
            
            # Get inventory distribution
            inventory = self.get_location_inventory(str(location.id))
            analytics['inventory_distribution'][location.name] = len(inventory)
        
        return analytics
    
    def sync_inventory_across_locations(self, product_id: str) -> bool:
        """Sync inventory levels across all locations for a product"""
        try:
            # Get all locations with this product
            products = self.db.query(Product).filter(
                and_(
                    Product.id == product_id,
                    Product.is_active == True
                )
            ).all()
            
            if not products:
                logger.warning(f"No active products found with ID {product_id}")
                return False
            
            # Calculate total stock across all locations
            total_stock = sum(p.current_stock for p in products)
            
            # Update each location's stock proportionally
            for product in products:
                if product.location:
                    # This is a simplified sync - in practice, you might want more sophisticated logic
                    product.current_stock = total_stock // len(products)
            
            self.db.commit()
            logger.info(f"Synced inventory for product {product_id} across {len(products)} locations")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing inventory: {e}")
            self.db.rollback()
            return False
