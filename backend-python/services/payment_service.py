"""
Payment processing service
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
import stripe
import os
import logging
from datetime import datetime

from .base_service import BaseService

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentService(BaseService):
    """Service for payment processing operations"""
    
    def __init__(self, db: Session):
        super().__init__(db)
    
    def process_card_payment(self, amount: float, currency: str = 'usd', 
                           customer_email: str = None, description: str = None) -> Dict[str, Any]:
        """Process card payment using Stripe"""
        try:
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                automatic_payment_methods={'enabled': True},
                metadata={
                    'customer_email': customer_email or '',
                    'description': description or 'Grocery Store Purchase'
                }
            )
            
            return {
                'success': True,
                'payment_intent_id': intent.id,
                'client_secret': intent.client_secret,
                'status': intent.status,
                'amount': amount,
                'currency': currency
            }
            
        except stripe.error.CardError as e:
            logger.error(f"Card error: {e}")
            return {
                'success': False,
                'error': 'Card was declined',
                'error_code': e.code,
                'error_message': str(e)
            }
        except stripe.error.RateLimitError as e:
            logger.error(f"Rate limit error: {e}")
            return {
                'success': False,
                'error': 'Too many requests',
                'error_message': str(e)
            }
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid request error: {e}")
            return {
                'success': False,
                'error': 'Invalid request',
                'error_message': str(e)
            }
        except stripe.error.AuthenticationError as e:
            logger.error(f"Authentication error: {e}")
            return {
                'success': False,
                'error': 'Authentication failed',
                'error_message': str(e)
            }
        except stripe.error.APIConnectionError as e:
            logger.error(f"API connection error: {e}")
            return {
                'success': False,
                'error': 'Network error',
                'error_message': str(e)
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return {
                'success': False,
                'error': 'Payment processing error',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {
                'success': False,
                'error': 'Unexpected error',
                'error_message': str(e)
            }
    
    def confirm_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        """Confirm a payment intent"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == 'succeeded':
                return {
                    'success': True,
                    'payment_intent_id': intent.id,
                    'status': intent.status,
                    'amount': intent.amount / 100,
                    'currency': intent.currency
                }
            else:
                return {
                    'success': False,
                    'error': 'Payment not completed',
                    'status': intent.status
                }
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error confirming payment: {e}")
            return {
                'success': False,
                'error': 'Payment confirmation failed',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error confirming payment: {e}")
            return {
                'success': False,
                'error': 'Unexpected error',
                'error_message': str(e)
            }
    
    def refund_payment(self, payment_intent_id: str, amount: float = None, 
                      reason: str = 'requested_by_customer') -> Dict[str, Any]:
        """Refund a payment"""
        try:
            refund_data = {
                'payment_intent': payment_intent_id,
                'reason': reason
            }
            
            if amount:
                refund_data['amount'] = int(amount * 100)  # Convert to cents
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                'success': True,
                'refund_id': refund.id,
                'amount': refund.amount / 100,
                'status': refund.status,
                'reason': refund.reason
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error processing refund: {e}")
            return {
                'success': False,
                'error': 'Refund failed',
                'error_message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error processing refund: {e}")
            return {
                'success': False,
                'error': 'Unexpected error',
                'error_message': str(e)
            }
    
    def process_cash_payment(self, amount: float, received_amount: float) -> Dict[str, Any]:
        """Process cash payment"""
        try:
            if received_amount < amount:
                return {
                    'success': False,
                    'error': 'Insufficient cash received',
                    'required_amount': amount,
                    'received_amount': received_amount,
                    'shortage': amount - received_amount
                }
            
            change = received_amount - amount
            
            return {
                'success': True,
                'payment_method': 'cash',
                'amount': amount,
                'received_amount': received_amount,
                'change': change
            }
            
        except Exception as e:
            logger.error(f"Error processing cash payment: {e}")
            return {
                'success': False,
                'error': 'Cash payment processing failed',
                'error_message': str(e)
            }
    
    def process_mobile_payment(self, payment_method: str, amount: float, 
                             phone_number: str = None) -> Dict[str, Any]:
        """Process mobile payment (placeholder for mobile payment integration)"""
        try:
            # This would integrate with mobile payment providers like:
            # - Apple Pay
            # - Google Pay
            # - Samsung Pay
            # - Mobile money services
            
            # For now, simulate successful mobile payment
            return {
                'success': True,
                'payment_method': payment_method,
                'amount': amount,
                'transaction_id': f"MOBILE_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'phone_number': phone_number
            }
            
        except Exception as e:
            logger.error(f"Error processing mobile payment: {e}")
            return {
                'success': False,
                'error': 'Mobile payment processing failed',
                'error_message': str(e)
            }
    
    def process_loyalty_points_payment(self, points_used: int, points_available: int, 
                                     points_value: float = 0.01) -> Dict[str, Any]:
        """Process loyalty points payment"""
        try:
            if points_used > points_available:
                return {
                    'success': False,
                    'error': 'Insufficient loyalty points',
                    'points_available': points_available,
                    'points_requested': points_used
                }
            
            points_value_amount = points_used * points_value
            
            return {
                'success': True,
                'payment_method': 'loyalty_points',
                'points_used': points_used,
                'points_value': points_value_amount,
                'remaining_points': points_available - points_used
            }
            
        except Exception as e:
            logger.error(f"Error processing loyalty points payment: {e}")
            return {
                'success': False,
                'error': 'Loyalty points payment processing failed',
                'error_message': str(e)
            }
    
    def get_payment_methods(self) -> List[Dict[str, Any]]:
        """Get available payment methods"""
        return [
            {
                'id': 'cash',
                'name': 'Cash',
                'description': 'Pay with cash',
                'enabled': True
            },
            {
                'id': 'card',
                'name': 'Credit/Debit Card',
                'description': 'Pay with card',
                'enabled': True
            },
            {
                'id': 'mobile',
                'name': 'Mobile Payment',
                'description': 'Pay with mobile wallet',
                'enabled': True
            },
            {
                'id': 'loyalty_points',
                'name': 'Loyalty Points',
                'description': 'Pay with loyalty points',
                'enabled': True
            }
        ]
    
    def validate_payment_amount(self, amount: float) -> Dict[str, Any]:
        """Validate payment amount"""
        if amount <= 0:
            return {
                'valid': False,
                'error': 'Amount must be greater than zero'
            }
        
        if amount > 10000:  # Maximum transaction limit
            return {
                'valid': False,
                'error': 'Amount exceeds maximum transaction limit'
            }
        
        return {
            'valid': True,
            'amount': amount
        }
    
    def calculate_tax(self, subtotal: float, tax_rate: float = 0.1) -> Dict[str, Any]:
        """Calculate tax amount"""
        try:
            tax_amount = subtotal * tax_rate
            total_amount = subtotal + tax_amount
            
            return {
                'subtotal': subtotal,
                'tax_rate': tax_rate,
                'tax_amount': tax_amount,
                'total_amount': total_amount
            }
            
        except Exception as e:
            logger.error(f"Error calculating tax: {e}")
            return {
                'error': 'Tax calculation failed',
                'error_message': str(e)
            }
    
    def calculate_discount(self, subtotal: float, discount_type: str, 
                          discount_value: float) -> Dict[str, Any]:
        """Calculate discount amount"""
        try:
            if discount_type == 'percentage':
                discount_amount = subtotal * (discount_value / 100)
            elif discount_type == 'fixed':
                discount_amount = min(discount_value, subtotal)  # Can't discount more than subtotal
            else:
                return {
                    'error': 'Invalid discount type',
                    'valid_types': ['percentage', 'fixed']
                }
            
            discounted_amount = subtotal - discount_amount
            
            return {
                'subtotal': subtotal,
                'discount_type': discount_type,
                'discount_value': discount_value,
                'discount_amount': discount_amount,
                'discounted_amount': discounted_amount
            }
            
        except Exception as e:
            logger.error(f"Error calculating discount: {e}")
            return {
                'error': 'Discount calculation failed',
                'error_message': str(e)
            }
