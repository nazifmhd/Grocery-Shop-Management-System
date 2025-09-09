"""
Inventory management service
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from datetime import datetime, timedelta
import logging

from models import Product, StockMovement, Category, Supplier, PurchaseOrder, PurchaseOrderItem
from .base_service import BaseService

logger = logging.getLogger(__name__)

class InventoryService(BaseService):
    """Service for inventory management operations"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def get_all_products(self, skip: int = 0, limit: int = 100) -> List[Product]:
        """Get all products with pagination"""
        return self.db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()
    
    def get_product_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        return self.db.query(Product).filter(Product.id == product_id).first()
    
    def get_product_by_barcode(self, barcode: str) -> Optional[Product]:
        """Get product by barcode"""
        return self.db.query(Product).filter(Product.barcode == barcode).first()
    
    def create_product(self, product_data: Dict[str, Any]) -> Product:
        """Create a new product"""
        product = Product(**product_data)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product
    
    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> Optional[Product]:
        """Update product information"""
        product = self.get_product_by_id(product_id)
        if product:
            for key, value in product_data.items():
                setattr(product, key, value)
            product.updated_at = datetime.now()
            self.db.commit()
            self.db.refresh(product)
        return product
    
    def delete_product(self, product_id: str) -> bool:
        """Soft delete a product"""
        product = self.get_product_by_id(product_id)
        if product:
            product.is_active = False
            self.db.commit()
            return True
        return False
    
    def get_low_stock_products(self) -> List[Product]:
        """Get products with stock below reorder level"""
        return self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.current_stock <= Product.reorder_level
            )
        ).all()
    
    def get_out_of_stock_products(self) -> List[Product]:
        """Get products that are out of stock"""
        return self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.current_stock <= 0
            )
        ).all()
    
    def update_stock(self, product_id: str, quantity: int, movement_type: str, 
                    reference_id: str = None, notes: str = None, created_by: str = None) -> bool:
        """Update product stock and create movement record"""
        try:
            product = self.get_product_by_id(product_id)
            if not product:
                return False
            
            # Calculate new stock level
            if movement_type in ['purchase', 'adjustment', 'return']:
                new_stock = product.current_stock + quantity
            elif movement_type in ['sale', 'waste']:
                new_stock = product.current_stock - quantity
            else:
                return False
            
            # Update product stock
            product.current_stock = max(0, new_stock)
            
            # Create stock movement record
            movement = StockMovement(
                product_id=product_id,
                movement_type=movement_type,
                quantity=quantity,
                unit_cost=product.cost_price,
                total_cost=product.cost_price * quantity if product.cost_price else 0,
                reference_id=reference_id,
                notes=notes,
                created_by=created_by
            )
            
            self.db.add(movement)
            self.db.commit()
            
            logger.info(f"Stock updated for product {product_id}: {movement_type} {quantity} units")
            return True
            
        except Exception as e:
            logger.error(f"Error updating stock: {e}")
            self.db.rollback()
            return False
    
    def get_stock_movements(self, product_id: str = None, 
                          movement_type: str = None, 
                          start_date: datetime = None, 
                          end_date: datetime = None,
                          skip: int = 0, limit: int = 100) -> List[StockMovement]:
        """Get stock movements with filters"""
        query = self.db.query(StockMovement)
        
        if product_id:
            query = query.filter(StockMovement.product_id == product_id)
        if movement_type:
            query = query.filter(StockMovement.movement_type == movement_type)
        if start_date:
            query = query.filter(StockMovement.created_at >= start_date)
        if end_date:
            query = query.filter(StockMovement.created_at <= end_date)
        
        return query.order_by(desc(StockMovement.created_at)).offset(skip).limit(limit).all()
    
    def get_inventory_summary(self) -> Dict[str, Any]:
        """Get inventory summary statistics"""
        total_products = self.db.query(Product).filter(Product.is_active == True).count()
        low_stock_count = len(self.get_low_stock_products())
        out_of_stock_count = len(self.get_out_of_stock_products())
        
        total_value = self.db.query(
            func.sum(Product.current_stock * Product.cost_price)
        ).filter(Product.is_active == True).scalar() or 0
        
        return {
            "total_products": total_products,
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
            "total_inventory_value": float(total_value),
            "low_stock_percentage": (low_stock_count / total_products * 100) if total_products > 0 else 0
        }
    
    def get_products_by_category(self, category_id: str) -> List[Product]:
        """Get products by category"""
        return self.db.query(Product).filter(
            and_(
                Product.category_id == category_id,
                Product.is_active == True
            )
        ).all()
    
    def get_products_by_supplier(self, supplier_id: str) -> List[Product]:
        """Get products by supplier"""
        return self.db.query(Product).filter(
            and_(
                Product.supplier_id == supplier_id,
                Product.is_active == True
            )
        ).all()
    
    def search_products(self, search_term: str) -> List[Product]:
        """Search products by name or barcode"""
        return self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                or_(
                    Product.name.ilike(f"%{search_term}%"),
                    Product.barcode.ilike(f"%{search_term}%"),
                    Product.description.ilike(f"%{search_term}%")
                )
            )
        ).all()
    
    def get_expiring_products(self, days_ahead: int = 30) -> List[Product]:
        """Get products expiring within specified days"""
        expiry_date = datetime.now().date() + timedelta(days=days_ahead)
        return self.db.query(Product).filter(
            and_(
                Product.is_active == True,
                Product.expiry_date.isnot(None),
                Product.expiry_date <= expiry_date,
                Product.current_stock > 0
            )
        ).order_by(Product.expiry_date).all()
    
    def create_purchase_order(self, supplier_id: str, items: List[Dict[str, Any]], 
                            created_by: str) -> PurchaseOrder:
        """Create a purchase order"""
        # Generate PO number
        po_count = self.db.query(PurchaseOrder).count() + 1
        po_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{po_count:04d}"
        
        # Calculate totals
        subtotal = sum(item['quantity'] * item['unit_cost'] for item in items)
        tax_amount = subtotal * 0.1  # 10% tax
        total_amount = subtotal + tax_amount
        
        # Create purchase order
        po = PurchaseOrder(
            po_number=po_number,
            supplier_id=supplier_id,
            order_date=datetime.now().date(),
            expected_delivery_date=datetime.now().date() + timedelta(days=7),
            status='pending',
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            created_by=created_by
        )
        
        self.db.add(po)
        self.db.flush()  # Get the ID
        
        # Create purchase order items
        for item in items:
            poi = PurchaseOrderItem(
                purchase_order_id=po.id,
                product_id=item['product_id'],
                quantity_ordered=item['quantity'],
                unit_cost=item['unit_cost'],
                line_total=item['quantity'] * item['unit_cost']
            )
            self.db.add(poi)
        
        self.db.commit()
        self.db.refresh(po)
        return po
    
    def receive_purchase_order(self, po_id: str, received_items: List[Dict[str, Any]]) -> bool:
        """Receive items from purchase order"""
        try:
            po = self.db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
            if not po:
                return False
            
            for item in received_items:
                # Update purchase order item
                poi = self.db.query(PurchaseOrderItem).filter(
                    and_(
                        PurchaseOrderItem.purchase_order_id == po_id,
                        PurchaseOrderItem.product_id == item['product_id']
                    )
                ).first()
                
                if poi:
                    poi.quantity_received = item['quantity_received']
                    
                    # Update product stock
                    self.update_stock(
                        product_id=item['product_id'],
                        quantity=item['quantity_received'],
                        movement_type='purchase',
                        reference_id=po_id,
                        notes=f"Received from PO {po.po_number}"
                    )
            
            # Update PO status
            po.status = 'delivered'
            po.actual_delivery_date = datetime.now().date()
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error receiving purchase order: {e}")
            self.db.rollback()
            return False
    
    def get_categories(self) -> List[Category]:
        """Get all categories"""
        return self.db.query(Category).filter(Category.is_active == True).all()
    
    def create_category(self, category_data: Dict[str, Any]) -> Category:
        """Create a new category"""
        category = Category(**category_data)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category
    
    def get_suppliers(self) -> List[Supplier]:
        """Get all suppliers"""
        return self.db.query(Supplier).filter(Supplier.is_active == True).all()
    
    def create_supplier(self, supplier_data: Dict[str, Any]) -> Supplier:
        """Create a new supplier"""
        supplier = Supplier(**supplier_data)
        self.db.add(supplier)
        self.db.commit()
        self.db.refresh(supplier)
        return supplier
