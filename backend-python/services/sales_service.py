"""
Sales and transaction management service
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from datetime import datetime, timedelta
import uuid
import logging

from models import SalesTransaction, SaleItem, Customer, Staff, Product, DailySalesSummary
from .base_service import BaseService

logger = logging.getLogger(__name__)

class SalesService(BaseService):
    """Service for sales and transaction operations"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def create_transaction(self, transaction_data: Dict[str, Any]) -> SalesTransaction:
        """Create a new sales transaction"""
        # Generate transaction number
        transaction_count = self.db.query(SalesTransaction).count() + 1
        transaction_number = f"TXN-{datetime.now().strftime('%Y%m%d')}-{transaction_count:06d}"
        
        # Create transaction
        transaction = SalesTransaction(
            transaction_number=transaction_number,
            customer_id=transaction_data.get('customer_id'),
            cashier_id=transaction_data.get('cashier_id'),
            subtotal=transaction_data.get('subtotal', 0),
            tax_amount=transaction_data.get('tax_amount', 0),
            discount_amount=transaction_data.get('discount_amount', 0),
            total_amount=transaction_data.get('total_amount', 0),
            payment_method=transaction_data.get('payment_method'),
            payment_status=transaction_data.get('payment_status', 'pending'),
            pos_terminal_id=transaction_data.get('pos_terminal_id'),
            is_return=transaction_data.get('is_return', False),
            original_transaction_id=transaction_data.get('original_transaction_id')
        )
        
        self.db.add(transaction)
        self.db.flush()  # Get the ID
        
        # Create sale items
        for item_data in transaction_data.get('items', []):
            sale_item = SaleItem(
                transaction_id=transaction.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                discount_amount=item_data.get('discount_amount', 0),
                line_total=item_data['line_total'],
                batch_number=item_data.get('batch_number'),
                expiry_date=item_data.get('expiry_date')
            )
            self.db.add(sale_item)
        
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def get_transaction_by_id(self, transaction_id: str) -> Optional[SalesTransaction]:
        """Get transaction by ID"""
        return self.db.query(SalesTransaction).filter(SalesTransaction.id == transaction_id).first()
    
    def get_transaction_by_number(self, transaction_number: str) -> Optional[SalesTransaction]:
        """Get transaction by transaction number"""
        return self.db.query(SalesTransaction).filter(
            SalesTransaction.transaction_number == transaction_number
        ).first()
    
    def get_transaction_items(self, transaction_id: str) -> List[SaleItem]:
        """Get items for a transaction"""
        return self.db.query(SaleItem).filter(SaleItem.transaction_id == transaction_id).all()
    
    def update_transaction_status(self, transaction_id: str, status: str) -> bool:
        """Update transaction payment status"""
        transaction = self.get_transaction_by_id(transaction_id)
        if transaction:
            transaction.payment_status = status
            self.db.commit()
            return True
        return False
    
    def process_return(self, original_transaction_id: str, return_items: List[Dict[str, Any]], 
                     cashier_id: str) -> Optional[SalesTransaction]:
        """Process a return transaction"""
        try:
            original_transaction = self.get_transaction_by_id(original_transaction_id)
            if not original_transaction:
                return None
            
            # Calculate return amounts
            return_subtotal = sum(item['line_total'] for item in return_items)
            return_tax = return_subtotal * 0.1  # 10% tax
            return_total = return_subtotal + return_tax
            
            # Create return transaction
            return_transaction = SalesTransaction(
                transaction_number=f"RET-{original_transaction.transaction_number}",
                customer_id=original_transaction.customer_id,
                cashier_id=cashier_id,
                subtotal=-return_subtotal,  # Negative for return
                tax_amount=-return_tax,
                discount_amount=0,
                total_amount=-return_total,
                payment_method=original_transaction.payment_method,
                payment_status='completed',
                pos_terminal_id=original_transaction.pos_terminal_id,
                is_return=True,
                original_transaction_id=original_transaction_id
            )
            
            self.db.add(return_transaction)
            self.db.flush()
            
            # Create return items
            for item_data in return_items:
                return_item = SaleItem(
                    transaction_id=return_transaction.id,
                    product_id=item_data['product_id'],
                    quantity=-item_data['quantity'],  # Negative for return
                    unit_price=item_data['unit_price'],
                    discount_amount=0,
                    line_total=-item_data['line_total'],
                    batch_number=item_data.get('batch_number'),
                    expiry_date=item_data.get('expiry_date')
                )
                self.db.add(return_item)
            
            self.db.commit()
            self.db.refresh(return_transaction)
            return return_transaction
            
        except Exception as e:
            logger.error(f"Error processing return: {e}")
            self.db.rollback()
            return None
    
    def get_transactions_by_date_range(self, start_date: datetime, end_date: datetime, 
                                     skip: int = 0, limit: int = 100) -> List[SalesTransaction]:
        """Get transactions within date range"""
        return self.db.query(SalesTransaction).filter(
            and_(
                SalesTransaction.transaction_date >= start_date,
                SalesTransaction.transaction_date <= end_date,
                SalesTransaction.is_return == False
            )
        ).order_by(desc(SalesTransaction.transaction_date)).offset(skip).limit(limit).all()
    
    def get_transactions_by_customer(self, customer_id: str, 
                                   skip: int = 0, limit: int = 100) -> List[SalesTransaction]:
        """Get transactions for a specific customer"""
        return self.db.query(SalesTransaction).filter(
            and_(
                SalesTransaction.customer_id == customer_id,
                SalesTransaction.is_return == False
            )
        ).order_by(desc(SalesTransaction.transaction_date)).offset(skip).limit(limit).all()
    
    def get_daily_sales_summary(self, date: datetime) -> Optional[DailySalesSummary]:
        """Get daily sales summary for a specific date"""
        return self.db.query(DailySalesSummary).filter(
            DailySalesSummary.date == date.date()
        ).first()
    
    def generate_daily_sales_summary(self, date: datetime) -> DailySalesSummary:
        """Generate daily sales summary for a specific date"""
        # Get transactions for the date
        start_datetime = datetime.combine(date.date(), datetime.min.time())
        end_datetime = datetime.combine(date.date(), datetime.max.time())
        
        transactions = self.get_transactions_by_date_range(start_datetime, end_datetime)
        
        # Calculate summary statistics
        total_transactions = len(transactions)
        total_revenue = sum(t.total_amount for t in transactions)
        total_items_sold = sum(
            sum(item.quantity for item in self.get_transaction_items(t.id)) 
            for t in transactions
        )
        average_transaction_value = total_revenue / total_transactions if total_transactions > 0 else 0
        
        # Calculate payment method breakdown
        cash_sales = sum(t.total_amount for t in transactions if t.payment_method == 'cash')
        card_sales = sum(t.total_amount for t in transactions if t.payment_method == 'card')
        
        # Get top selling product
        product_sales = {}
        for transaction in transactions:
            for item in self.get_transaction_items(transaction.id):
                if item.product_id in product_sales:
                    product_sales[item.product_id] += item.quantity
                else:
                    product_sales[item.product_id] = item.quantity
        
        top_selling_product_id = max(product_sales.items(), key=lambda x: x[1])[0] if product_sales else None
        
        # Create or update summary
        summary = self.get_daily_sales_summary(date)
        if summary:
            summary.total_transactions = total_transactions
            summary.total_revenue = total_revenue
            summary.total_items_sold = total_items_sold
            summary.average_transaction_value = average_transaction_value
            summary.top_selling_product_id = top_selling_product_id
            summary.cash_sales = cash_sales
            summary.card_sales = card_sales
        else:
            summary = DailySalesSummary(
                date=date.date(),
                total_transactions=total_transactions,
                total_revenue=total_revenue,
                total_items_sold=total_items_sold,
                average_transaction_value=average_transaction_value,
                top_selling_product_id=top_selling_product_id,
                cash_sales=cash_sales,
                card_sales=card_sales
            )
            self.db.add(summary)
        
        self.db.commit()
        self.db.refresh(summary)
        return summary
    
    def get_sales_analytics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get sales analytics for date range"""
        transactions = self.get_transactions_by_date_range(start_date, end_date)
        
        # Calculate metrics
        total_revenue = sum(t.total_amount for t in transactions)
        total_transactions = len(transactions)
        average_transaction_value = total_revenue / total_transactions if total_transactions > 0 else 0
        
        # Payment method breakdown
        payment_methods = {}
        for transaction in transactions:
            method = transaction.payment_method or 'unknown'
            if method in payment_methods:
                payment_methods[method] += transaction.total_amount
            else:
                payment_methods[method] = transaction.total_amount
        
        # Top products
        product_sales = {}
        for transaction in transactions:
            for item in self.get_transaction_items(transaction.id):
                if item.product_id in product_sales:
                    product_sales[item.product_id]['quantity'] += item.quantity
                    product_sales[item.product_id]['revenue'] += item.line_total
                else:
                    product_sales[item.product_id] = {
                        'quantity': item.quantity,
                        'revenue': item.line_total
                    }
        
        top_products = sorted(product_sales.items(), key=lambda x: x[1]['revenue'], reverse=True)[:10]
        
        return {
            'total_revenue': float(total_revenue),
            'total_transactions': total_transactions,
            'average_transaction_value': float(average_transaction_value),
            'payment_methods': payment_methods,
            'top_products': top_products,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }
    
    def get_customer_sales_history(self, customer_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get customer sales history with product details"""
        transactions = self.get_transactions_by_customer(customer_id, limit=limit)
        
        history = []
        for transaction in transactions:
            items = self.get_transaction_items(transaction.id)
            history.append({
                'transaction': {
                    'id': str(transaction.id),
                    'transaction_number': transaction.transaction_number,
                    'date': transaction.transaction_date.isoformat(),
                    'total_amount': float(transaction.total_amount),
                    'payment_method': transaction.payment_method
                },
                'items': [
                    {
                        'product_id': str(item.product_id),
                        'quantity': item.quantity,
                        'unit_price': float(item.unit_price),
                        'line_total': float(item.line_total)
                    }
                    for item in items
                ]
            })
        
        return history
