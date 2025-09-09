"""
Customer and loyalty related database models
"""

from sqlalchemy import Column, String, Text, Integer, Decimal, Boolean, Date, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class CustomerProfile(Base):
    """Extended customer profile with preferences and behavior data"""
    __tablename__ = "customer_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), unique=True)
    preferences = Column(JSON)  # Store customer preferences as JSON
    dietary_restrictions = Column(ARRAY(String))  # Array of dietary restrictions
    favorite_categories = Column(ARRAY(String))  # Array of favorite category IDs
    communication_preferences = Column(JSON)  # Email, SMS, push notification preferences
    birthday = Column(Date)
    anniversary = Column(Date)
    notes = Column(Text)
    created_at = Column(Date, server_default=func.now())
    updated_at = Column(Date, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="profile")

class LoyaltyProgram(Base):
    """Loyalty program configuration"""
    __tablename__ = "loyalty_programs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    points_per_dollar = Column(Decimal(5, 2), default=1.0)
    points_per_visit = Column(Integer, default=0)
    birthday_bonus_points = Column(Integer, default=0)
    minimum_redemption_points = Column(Integer, default=100)
    points_expiry_days = Column(Integer)  # NULL means no expiry
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    tiers = relationship("LoyaltyTier", back_populates="program")

class LoyaltyTier(Base):
    """Loyalty program tiers"""
    __tablename__ = "loyalty_tiers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_id = Column(UUID(as_uuid=True), ForeignKey("loyalty_programs.id"))
    tier_name = Column(String(50), nullable=False)
    minimum_points = Column(Integer, default=0)
    maximum_points = Column(Integer)  # NULL means no maximum
    discount_percentage = Column(Decimal(5, 2), default=0)
    special_offers = Column(JSON)  # Special offers for this tier
    is_active = Column(Boolean, default=True)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    program = relationship("LoyaltyProgram", back_populates="tiers")

class CustomerLoyaltyStatus(Base):
    """Customer loyalty status and tier information"""
    __tablename__ = "customer_loyalty_status"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), unique=True)
    program_id = Column(UUID(as_uuid=True), ForeignKey("loyalty_programs.id"))
    current_tier_id = Column(UUID(as_uuid=True), ForeignKey("loyalty_tiers.id"))
    total_points = Column(Integer, default=0)
    available_points = Column(Integer, default=0)
    lifetime_points = Column(Integer, default=0)
    last_activity_date = Column(Date)
    tier_achieved_date = Column(Date)
    next_tier_points_needed = Column(Integer)
    created_at = Column(Date, server_default=func.now())
    updated_at = Column(Date, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="loyalty_status")
    program = relationship("LoyaltyProgram")
    current_tier = relationship("LoyaltyTier")

class LoyaltyTransaction(Base):
    """Loyalty points transactions"""
    __tablename__ = "loyalty_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"))
    transaction_type = Column(String(20))  # earned, redeemed, expired, adjusted
    points = Column(Integer)  # Positive for earned, negative for redeemed
    description = Column(String(200))
    reference_id = Column(UUID(as_uuid=True))  # Links to sales transaction, etc.
    expiry_date = Column(Date)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="loyalty_transactions")

class CustomerFeedback(Base):
    """Customer feedback and reviews"""
    __tablename__ = "customer_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text)
    feedback_type = Column(String(20))  # product, service, store, delivery
    is_public = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(Date, server_default=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="feedback")
    product = relationship("Product", back_populates="feedback")

class CustomerCommunication(Base):
    """Customer communication history"""
    __tablename__ = "customer_communications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"))
    communication_type = Column(String(20))  # email, sms, push, call
    subject = Column(String(200))
    message = Column(Text)
    status = Column(String(20))  # sent, delivered, read, failed
    sent_at = Column(Date, server_default=func.now())
    delivered_at = Column(Date)
    read_at = Column(Date)
    
    # Relationships
    customer = relationship("Customer", back_populates="communications")

# Add relationships to existing Customer model
from .sales_models import Customer

Customer.profile = relationship("CustomerProfile", back_populates="customer", uselist=False)
Customer.loyalty_status = relationship("CustomerLoyaltyStatus", back_populates="customer", uselist=False)
Customer.loyalty_transactions = relationship("LoyaltyTransaction", back_populates="customer")
Customer.feedback = relationship("CustomerFeedback", back_populates="customer")
Customer.communications = relationship("CustomerCommunication", back_populates="customer")

# Add relationships to existing Product model
from .product_models import Product

Product.feedback = relationship("CustomerFeedback", back_populates="product")
