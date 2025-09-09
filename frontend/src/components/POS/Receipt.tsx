import React from 'react';
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ReceiptProps {
  transaction: {
    id: string;
    transaction_number: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    payment_method: string;
    transaction_date: string;
    items: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
  };
  onPrint: () => void;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, onPrint, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPaymentMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      'cash': 'Cash',
      'card': 'Credit/Debit Card',
      'mobile': 'Mobile Payment',
      'loyalty_points': 'Loyalty Points'
    };
    return methods[method] || method;
  };

  return (
    <div className="receipt">
      {/* Receipt Header */}
      <div className="receipt-header">
        <h2 className="text-lg font-bold">🛒 GROCERY STORE</h2>
        <p className="text-sm">123 Main Street</p>
        <p className="text-sm">City, State 12345</p>
        <p className="text-sm">Phone: (555) 123-4567</p>
        <div className="border-t border-gray-300 mt-2 pt-2">
          <p className="text-sm font-semibold">
            Receipt #{transaction.transaction_number}
          </p>
          <p className="text-sm">{formatDate(transaction.transaction_date)}</p>
        </div>
      </div>

      {/* Receipt Items */}
      <div className="receipt-items">
        <div className="flex justify-between text-xs font-semibold border-b border-gray-300 pb-1 mb-2">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
        </div>
        
        {transaction.items.map((item, index) => (
          <div key={index} className="receipt-item text-xs">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
            </div>
            <div className="w-8 text-center">{item.quantity}</div>
            <div className="w-12 text-right">${item.unit_price.toFixed(2)}</div>
            <div className="w-12 text-right font-medium">${item.line_total.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Receipt Totals */}
      <div className="receipt-total">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>${transaction.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax:</span>
          <span>${transaction.tax_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-1">
          <span>Total:</span>
          <span>${transaction.total_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>Payment Method:</span>
          <span>{formatPaymentMethod(transaction.payment_method)}</span>
        </div>
      </div>

      {/* Receipt Footer */}
      <div className="text-center mt-4 text-xs text-gray-600">
        <p>Thank you for your business!</p>
        <p>Please come again</p>
        <div className="border-t border-gray-300 mt-2 pt-2">
          <p>Return Policy: 30 days with receipt</p>
          <p>Questions? Call (555) 123-4567</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-6 no-print">
        <button
          onClick={onPrint}
          className="btn btn-primary btn-sm flex-1 flex items-center justify-center"
        >
          <PrinterIcon className="h-4 w-4 mr-2" />
          Print Receipt
        </button>
        <button
          onClick={onClose}
          className="btn btn-secondary btn-sm flex-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Receipt;
