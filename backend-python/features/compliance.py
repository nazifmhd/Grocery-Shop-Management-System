"""
Compliance and regulatory features
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
import json

from models import Product, SalesTransaction, StockMovement, ComplianceRecord
from .base_service import BaseService

logger = logging.getLogger(__name__)

class ComplianceService(BaseService):
    """Service for compliance and regulatory management"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def check_product_compliance(self, product_id: str) -> Dict[str, Any]:
        """Check if product meets compliance requirements"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {'compliant': False, 'errors': ['Product not found']}
        
        compliance_issues = []
        
        # Check if product has required information
        if not product.name:
            compliance_issues.append('Product name is required')
        
        if not product.cost_price or product.cost_price <= 0:
            compliance_issues.append('Valid cost price is required')
        
        if not product.selling_price or product.selling_price <= 0:
            compliance_issues.append('Valid selling price is required')
        
        if product.selling_price <= product.cost_price:
            compliance_issues.append('Selling price must be greater than cost price')
        
        # Check expiry date for perishable items
        if product.expiry_date and product.expiry_date < datetime.now().date():
            compliance_issues.append('Product has expired')
        
        # Check if product is properly categorized
        if not product.category_id:
            compliance_issues.append('Product category is required')
        
        return {
            'compliant': len(compliance_issues) == 0,
            'issues': compliance_issues,
            'product_id': product_id,
            'checked_at': datetime.now().isoformat()
        }
    
    def generate_sales_tax_report(self, start_date: datetime, end_date: datetime, 
                                location_id: str = None) -> Dict[str, Any]:
        """Generate sales tax report for compliance"""
        query = self.db.query(SalesTransaction).filter(
            and_(
                SalesTransaction.transaction_date >= start_date,
                SalesTransaction.transaction_date <= end_date,
                SalesTransaction.is_return == False
            )
        )
        
        if location_id:
            query = query.filter(SalesTransaction.location_id == location_id)
        
        transactions = query.all()
        
        total_sales = sum(t.subtotal for t in transactions)
        total_tax = sum(t.tax_amount for t in transactions)
        total_transactions = len(transactions)
        
        # Group by tax rate
        tax_breakdown = {}
        for transaction in transactions:
            tax_rate = (transaction.tax_amount / transaction.subtotal * 100) if transaction.subtotal > 0 else 0
            tax_rate_key = f"{tax_rate:.2f}%"
            
            if tax_rate_key not in tax_breakdown:
                tax_breakdown[tax_rate_key] = {
                    'rate': tax_rate,
                    'transactions': 0,
                    'sales_amount': 0,
                    'tax_amount': 0
                }
            
            tax_breakdown[tax_rate_key]['transactions'] += 1
            tax_breakdown[tax_rate_key]['sales_amount'] += float(transaction.subtotal)
            tax_breakdown[tax_rate_key]['tax_amount'] += float(transaction.tax_amount)
        
        return {
            'report_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'location_id': location_id,
            'summary': {
                'total_sales': float(total_sales),
                'total_tax': float(total_tax),
                'total_transactions': total_transactions,
                'average_tax_rate': (total_tax / total_sales * 100) if total_sales > 0 else 0
            },
            'tax_breakdown': tax_breakdown,
            'generated_at': datetime.now().isoformat()
        }
    
    def audit_inventory_movements(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Audit inventory movements for compliance"""
        movements = self.db.query(StockMovement).filter(
            and_(
                StockMovement.created_at >= start_date,
                StockMovement.created_at <= end_date
            )
        ).all()
        
        audit_results = {
            'total_movements': len(movements),
            'movement_types': {},
            'discrepancies': [],
            'compliance_issues': []
        }
        
        # Analyze movement types
        for movement in movements:
            movement_type = movement.movement_type
            if movement_type not in audit_results['movement_types']:
                audit_results['movement_types'][movement_type] = {
                    'count': 0,
                    'total_quantity': 0,
                    'total_value': 0
                }
            
            audit_results['movement_types'][movement_type]['count'] += 1
            audit_results['movement_types'][movement_type]['total_quantity'] += abs(movement.quantity)
            audit_results['movement_types'][movement_type]['total_value'] += float(movement.total_cost or 0)
        
        # Check for discrepancies
        for movement in movements:
            if movement.quantity == 0:
                audit_results['discrepancies'].append({
                    'movement_id': str(movement.id),
                    'issue': 'Zero quantity movement',
                    'timestamp': movement.created_at.isoformat()
                })
            
            if movement.total_cost and movement.unit_cost and movement.quantity:
                expected_total = float(movement.unit_cost) * abs(movement.quantity)
                actual_total = float(movement.total_cost)
                if abs(expected_total - actual_total) > 0.01:  # Allow for small rounding differences
                    audit_results['discrepancies'].append({
                        'movement_id': str(movement.id),
                        'issue': 'Cost calculation mismatch',
                        'expected': expected_total,
                        'actual': actual_total,
                        'timestamp': movement.created_at.isoformat()
                    })
        
        return audit_results
    
    def generate_financial_report(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate financial report for compliance"""
        # Sales data
        sales_transactions = self.db.query(SalesTransaction).filter(
            and_(
                SalesTransaction.transaction_date >= start_date,
                SalesTransaction.transaction_date <= end_date,
                SalesTransaction.is_return == False
            )
        ).all()
        
        total_revenue = sum(t.total_amount for t in sales_transactions)
        total_cost = sum(t.subtotal for t in sales_transactions)  # Assuming subtotal represents cost
        gross_profit = total_revenue - total_cost
        
        # Inventory data
        products = self.db.query(Product).filter(Product.is_active == True).all()
        total_inventory_value = sum(p.current_stock * p.cost_price for p in products if p.cost_price)
        
        # Payment method breakdown
        payment_methods = {}
        for transaction in sales_transactions:
            method = transaction.payment_method or 'unknown'
            if method not in payment_methods:
                payment_methods[method] = {
                    'count': 0,
                    'amount': 0
                }
            payment_methods[method]['count'] += 1
            payment_methods[method]['amount'] += float(transaction.total_amount)
        
        return {
            'report_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'financial_summary': {
                'total_revenue': float(total_revenue),
                'total_cost': float(total_cost),
                'gross_profit': float(gross_profit),
                'gross_profit_margin': (gross_profit / total_revenue * 100) if total_revenue > 0 else 0,
                'total_inventory_value': float(total_inventory_value)
            },
            'transaction_summary': {
                'total_transactions': len(sales_transactions),
                'average_transaction_value': float(total_revenue / len(sales_transactions)) if sales_transactions else 0
            },
            'payment_methods': payment_methods,
            'generated_at': datetime.now().isoformat()
        }
    
    def check_data_retention_compliance(self) -> Dict[str, Any]:
        """Check data retention compliance"""
        retention_periods = {
            'transactions': 7,  # years
            'inventory_movements': 5,  # years
            'customer_data': 3,  # years
            'audit_logs': 10  # years
        }
        
        compliance_status = {}
        cutoff_date = datetime.now() - timedelta(days=365 * max(retention_periods.values()))
        
        # Check transaction data
        old_transactions = self.db.query(SalesTransaction).filter(
            SalesTransaction.transaction_date < cutoff_date
        ).count()
        
        compliance_status['transactions'] = {
            'retention_period_years': retention_periods['transactions'],
            'old_records_count': old_transactions,
            'compliant': old_transactions == 0
        }
        
        # Check inventory movements
        old_movements = self.db.query(StockMovement).filter(
            StockMovement.created_at < cutoff_date
        ).count()
        
        compliance_status['inventory_movements'] = {
            'retention_period_years': retention_periods['inventory_movements'],
            'old_records_count': old_movements,
            'compliant': old_movements == 0
        }
        
        return {
            'overall_compliant': all(status['compliant'] for status in compliance_status.values()),
            'retention_policies': retention_periods,
            'compliance_status': compliance_status,
            'checked_at': datetime.now().isoformat()
        }
    
    def create_compliance_record(self, record_type: str, data: Dict[str, Any]) -> ComplianceRecord:
        """Create a compliance record"""
        record = ComplianceRecord(
            record_type=record_type,
            data=json.dumps(data),
            created_at=datetime.now()
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
    
    def get_compliance_records(self, record_type: str = None, 
                             start_date: datetime = None, 
                             end_date: datetime = None) -> List[ComplianceRecord]:
        """Get compliance records"""
        query = self.db.query(ComplianceRecord)
        
        if record_type:
            query = query.filter(ComplianceRecord.record_type == record_type)
        
        if start_date:
            query = query.filter(ComplianceRecord.created_at >= start_date)
        
        if end_date:
            query = query.filter(ComplianceRecord.created_at <= end_date)
        
        return query.order_by(desc(ComplianceRecord.created_at)).all()
