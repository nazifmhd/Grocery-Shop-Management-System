"""
Product and inventory related database models
"""

from sqlalchemy import Column, String, Text, Integer, Decimal, Boolean, Date, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class Category(Base):
    """Product categories with hierarchical structure"""
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    parent_category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    parent_category = relationship("Category", remote_side=[id], backref="subcategories")
    products = relationship("Product", back_populates="category")

class Supplier(Base):
    """Supplier information and contact details"""
    __tablename__ = "suppliers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    payment_terms = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class Product(Base):
    """Product information and inventory details"""
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    barcode = Column(String(50), unique=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"))
    cost_price = Column(Decimal(10, 2))
    selling_price = Column(Decimal(10, 2))
    discount_percentage = Column(Decimal(5, 2), default=0)
    tax_rate = Column(Decimal(5, 2), default=0)
    unit_type = Column(String(20))  # kg, pieces, liters
    minimum_stock = Column(Integer, default=0)
    maximum_stock = Column(Integer)
    current_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=0)
    expiry_date = Column(Date)
    batch_number = Column(String(50))
    location = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    updated_at = Column(Date, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="product")

class StockMovement(Base):
    """Track all inventory movements"""
    __tablename__ = "stock_movements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    movement_type = Column(String(20))  # purchase, sale, adjustment, return, waste
    quantity = Column(Integer)
    unit_cost = Column(Decimal(10, 2))
    total_cost = Column(Decimal(10, 2))
    reference_id = Column(UUID(as_uuid=True))  # links to purchase_order, sale_transaction, etc.
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("staff.id"))
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="stock_movements")
    staff_member = relationship("Staff", back_populates="stock_movements")

class PurchaseOrder(Base):
    """Purchase orders to suppliers"""
    __tablename__ = "purchase_orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    po_number = Column(String(50), unique=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"))
    order_date = Column(Date)
    expected_delivery_date = Column(Date)
    actual_delivery_date = Column(Date)
    status = Column(String(20))  # pending, confirmed, delivered, cancelled
    subtotal = Column(Decimal(12, 2))
    tax_amount = Column(Decimal(10, 2))
    total_amount = Column(Decimal(12, 2))
    created_by = Column(UUID(as_uuid=True), ForeignKey("staff.id"))
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")
    created_by_staff = relationship("Staff", back_populates="created_purchase_orders")

class PurchaseOrderItem(Base):
    """Items in purchase orders"""
    __tablename__ = "purchase_order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_order_id = Column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    quantity_ordered = Column(Integer)
    quantity_received = Column(Integer, default=0)
    unit_cost = Column(Decimal(10, 2))
    line_total = Column(Decimal(10, 2))
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product", back_populates="purchase_order_items")

class Promotion(Base):
    """Promotions and discounts"""
    __tablename__ = "promotions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100))
    description = Column(Text)
    promotion_type = Column(String(20))  # percentage, fixed_amount, bogo, bulk_discount
    discount_value = Column(Decimal(10, 2))
    minimum_purchase_amount = Column(Decimal(10, 2))
    start_date = Column(Date)
    end_date = Column(Date)
    applicable_categories = Column(ARRAY(String))  # Array of category IDs
    applicable_products = Column(ARRAY(String))  # Array of product IDs
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
