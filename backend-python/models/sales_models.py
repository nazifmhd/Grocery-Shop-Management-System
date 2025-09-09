"""
Sales and transaction related database models
"""

from sqlalchemy import Column, String, Text, Integer, Decimal, Boolean, Date, ForeignKey, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class Customer(Base):
    """Customer information and loyalty data"""
    __tablename__ = "customers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_code = Column(String(50), unique=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(50))
    postal_code = Column(String(20))
    loyalty_points = Column(Integer, default=0)
    total_purchases = Column(Decimal(12, 2), default=0)
    last_purchase_date = Column(Date)
    customer_type = Column(String(20), default='regular')  # regular, premium, wholesale
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    sales_transactions = relationship("SalesTransaction", back_populates="customer")

class Staff(Base):
    """Staff and employee information"""
    __tablename__ = "staff"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(String(20), unique=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True)
    phone = Column(String(20))
    role = Column(String(20))  # manager, cashier, inventory_clerk, sales_associate
    hire_date = Column(Date)
    salary = Column(Decimal(10, 2))
    commission_rate = Column(Decimal(5, 2))
    shift_start = Column(Time)
    shift_end = Column(Time)
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    sales_transactions = relationship("SalesTransaction", back_populates="cashier")
    stock_movements = relationship("StockMovement", back_populates="staff_member")
    created_purchase_orders = relationship("PurchaseOrder", back_populates="created_by_staff")

class SalesTransaction(Base):
    """Sales transactions and receipts"""
    __tablename__ = "sales_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_number = Column(String(50), unique=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"))
    cashier_id = Column(UUID(as_uuid=True), ForeignKey("staff.id"))
    subtotal = Column(Decimal(10, 2))
    tax_amount = Column(Decimal(10, 2))
    discount_amount = Column(Decimal(10, 2), default=0)
    total_amount = Column(Decimal(10, 2))
    payment_method = Column(String(20))  # cash, card, mobile, loyalty_points
    payment_status = Column(String(20), default='completed')
    transaction_date = Column(Date, server_default=func.now())
    pos_terminal_id = Column(String(50))
    receipt_printed = Column(Boolean, default=False)
    is_return = Column(Boolean, default=False)
    original_transaction_id = Column(UUID(as_uuid=True), ForeignKey("sales_transactions.id"))
    
    # Relationships
    customer = relationship("Customer", back_populates="sales_transactions")
    cashier = relationship("Staff", back_populates="sales_transactions")
    items = relationship("SaleItem", back_populates="transaction")
    original_transaction = relationship("SalesTransaction", remote_side=[id])

class SaleItem(Base):
    """Individual items in sales transactions"""
    __tablename__ = "sale_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("sales_transactions.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Decimal(10, 2))
    discount_amount = Column(Decimal(10, 2), default=0)
    line_total = Column(Decimal(10, 2))
    batch_number = Column(String(50))
    expiry_date = Column(Date)
    
    # Relationships
    transaction = relationship("SalesTransaction", back_populates="items")
    product = relationship("Product", back_populates="sale_items")

class DailySalesSummary(Base):
    """Daily sales analytics and summaries"""
    __tablename__ = "daily_sales_summary"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(Date, unique=True)
    total_transactions = Column(Integer)
    total_revenue = Column(Decimal(12, 2))
    total_items_sold = Column(Integer)
    average_transaction_value = Column(Decimal(10, 2))
    top_selling_product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    cash_sales = Column(Decimal(12, 2))
    card_sales = Column(Decimal(12, 2))
    returns_amount = Column(Decimal(12, 2))
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    top_selling_product = relationship("Product")
