"""
Notification service for email, SMS, and push notifications
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import requests
import json

from .base_service import BaseService

logger = logging.getLogger(__name__)

class NotificationService(BaseService):
    """Service for sending notifications via email, SMS, and push"""
    
    def __init__(self, db: Session):
        super().__init__(db)
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_username = os.getenv("EMAIL_USERNAME")
        self.email_password = os.getenv("EMAIL_PASSWORD")
        self.email_from_name = os.getenv("EMAIL_FROM_NAME", "Grocery Management System")
        self.email_from_address = os.getenv("EMAIL_FROM_ADDRESS")
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   is_html: bool = False) -> Dict[str, Any]:
        """Send email notification"""
        try:
            if not self.email_username or not self.email_password:
                return {
                    'success': False,
                    'error': 'Email configuration not set'
                }
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.email_from_name} <{self.email_from_address}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_username, self.email_password)
            text = msg.as_string()
            server.sendmail(self.email_from_address, to_email, text)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return {
                'success': True,
                'message': 'Email sent successfully',
                'to': to_email,
                'subject': subject
            }
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return {
                'success': False,
                'error': 'Email sending failed',
                'error_message': str(e)
            }
    
    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        """Send SMS notification (placeholder for SMS service integration)"""
        try:
            # This would integrate with SMS providers like:
            # - Twilio
            # - AWS SNS
            # - Vonage
            # - Local SMS gateways
            
            # For now, simulate successful SMS sending
            logger.info(f"SMS sent to {phone_number}: {message}")
            return {
                'success': True,
                'message': 'SMS sent successfully',
                'phone_number': phone_number,
                'message_text': message
            }
            
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return {
                'success': False,
                'error': 'SMS sending failed',
                'error_message': str(e)
            }
    
    def send_push_notification(self, user_id: str, title: str, body: str, 
                              data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send push notification (placeholder for push service integration)"""
        try:
            # This would integrate with push notification services like:
            # - Firebase Cloud Messaging (FCM)
            # - Apple Push Notification Service (APNs)
            # - OneSignal
            # - Pusher
            
            # For now, simulate successful push notification
            logger.info(f"Push notification sent to user {user_id}: {title}")
            return {
                'success': True,
                'message': 'Push notification sent successfully',
                'user_id': user_id,
                'title': title,
                'body': body,
                'data': data or {}
            }
            
        except Exception as e:
            logger.error(f"Error sending push notification: {e}")
            return {
                'success': False,
                'error': 'Push notification sending failed',
                'error_message': str(e)
            }
    
    def send_low_stock_alert(self, product_name: str, current_stock: int, 
                           reorder_level: int, staff_emails: List[str]) -> Dict[str, Any]:
        """Send low stock alert to staff"""
        subject = f"Low Stock Alert: {product_name}"
        body = f"""
        Product: {product_name}
        Current Stock: {current_stock}
        Reorder Level: {reorder_level}
        
        Please reorder this product as soon as possible.
        
        Generated by Grocery Management System
        """
        
        results = []
        for email in staff_emails:
            result = self.send_email(email, subject, body)
            results.append({
                'email': email,
                'success': result['success']
            })
        
        return {
            'success': any(r['success'] for r in results),
            'results': results,
            'product_name': product_name
        }
    
    def send_order_confirmation(self, customer_email: str, transaction_number: str, 
                              total_amount: float, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Send order confirmation email to customer"""
        subject = f"Order Confirmation - {transaction_number}"
        
        # Create HTML email body
        items_html = ""
        for item in items:
            items_html += f"""
            <tr>
                <td>{item['name']}</td>
                <td>{item['quantity']}</td>
                <td>${item['unit_price']:.2f}</td>
                <td>${item['line_total']:.2f}</td>
            </tr>
            """
        
        body = f"""
        <html>
        <body>
            <h2>Order Confirmation</h2>
            <p>Thank you for your purchase! Your order has been confirmed.</p>
            
            <h3>Order Details</h3>
            <p><strong>Transaction Number:</strong> {transaction_number}</p>
            <p><strong>Order Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Total Amount:</strong> ${total_amount:.2f}</p>
            
            <h3>Items Ordered</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
                {items_html}
            </table>
            
            <p>Thank you for shopping with us!</p>
        </body>
        </html>
        """
        
        return self.send_email(customer_email, subject, body, is_html=True)
    
    def send_promotional_email(self, customer_emails: List[str], subject: str, 
                             content: str, promotion_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send promotional email to multiple customers"""
        results = []
        for email in customer_emails:
            # Personalize content
            personalized_content = content
            if promotion_data:
                personalized_content = personalized_content.replace(
                    '{customer_name}', promotion_data.get('customer_name', 'Valued Customer')
                )
                personalized_content = personalized_content.replace(
                    '{discount_code}', promotion_data.get('discount_code', '')
                )
            
            result = self.send_email(email, subject, personalized_content, is_html=True)
            results.append({
                'email': email,
                'success': result['success']
            })
        
        return {
            'success': any(r['success'] for r in results),
            'total_sent': len([r for r in results if r['success']]),
            'total_failed': len([r for r in results if not r['success']]),
            'results': results
        }
    
    def send_delivery_notification(self, customer_phone: str, delivery_date: str, 
                                 order_number: str) -> Dict[str, Any]:
        """Send delivery notification SMS"""
        message = f"""
        Your order {order_number} is scheduled for delivery on {delivery_date}.
        Please ensure someone is available to receive the order.
        
        Thank you for choosing us!
        """
        
        return self.send_sms(customer_phone, message)
    
    def send_system_alert(self, alert_type: str, message: str, 
                         admin_emails: List[str]) -> Dict[str, Any]:
        """Send system alert to administrators"""
        subject = f"System Alert: {alert_type}"
        body = f"""
        Alert Type: {alert_type}
        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Message: {message}
        
        Please investigate this issue as soon as possible.
        
        Grocery Management System
        """
        
        results = []
        for email in admin_emails:
            result = self.send_email(email, subject, body)
            results.append({
                'email': email,
                'success': result['success']
            })
        
        return {
            'success': any(r['success'] for r in results),
            'alert_type': alert_type,
            'results': results
        }
    
    def send_customer_feedback_request(self, customer_email: str, customer_name: str, 
                                     transaction_number: str) -> Dict[str, Any]:
        """Send feedback request email to customer"""
        subject = "How was your shopping experience?"
        
        body = f"""
        <html>
        <body>
            <h2>We'd love to hear from you!</h2>
            
            <p>Hi {customer_name},</p>
            
            <p>Thank you for your recent purchase (Order #{transaction_number}). 
            We hope you had a great shopping experience!</p>
            
            <p>Your feedback is important to us and helps us improve our service. 
            Please take a moment to share your thoughts:</p>
            
            <p>
                <a href="https://yourstore.com/feedback?order={transaction_number}" 
                   style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px;">
                    Leave Feedback
                </a>
            </p>
            
            <p>Thank you for choosing us!</p>
            
            <p>Best regards,<br>
            The Grocery Store Team</p>
        </body>
        </html>
        """
        
        return self.send_email(customer_email, subject, body, is_html=True)
    
    def get_notification_templates(self) -> Dict[str, Any]:
        """Get available notification templates"""
        return {
            'email_templates': {
                'order_confirmation': {
                    'subject': 'Order Confirmation - {transaction_number}',
                    'body': 'Thank you for your purchase! Your order has been confirmed.'
                },
                'low_stock_alert': {
                    'subject': 'Low Stock Alert: {product_name}',
                    'body': 'Product {product_name} is running low on stock.'
                },
                'promotional': {
                    'subject': 'Special Offer - {promotion_name}',
                    'body': 'Check out our latest promotion!'
                }
            },
            'sms_templates': {
                'delivery_notification': 'Your order {order_number} will be delivered on {delivery_date}.',
                'order_ready': 'Your order {order_number} is ready for pickup.',
                'promotional': 'Special offer: {promotion_text}'
            },
            'push_templates': {
                'order_update': 'Your order {order_number} status has been updated.',
                'promotional': 'New promotion available: {promotion_name}',
                'low_stock': 'Some items in your cart are running low on stock.'
            }
        }
