import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  DevicePhoneMobileIcon, 
  GiftIcon 
} from '@heroicons/react/24/outline';

interface PaymentProcessorProps {
  total: number;
  onPayment: (paymentData: any) => void;
  isProcessing: boolean;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  total,
  onPayment,
  isProcessing
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: BanknotesIcon, color: 'text-green-600' },
    { id: 'card', name: 'Card', icon: CreditCardIcon, color: 'text-blue-600' },
    { id: 'mobile', name: 'Mobile', icon: DevicePhoneMobileIcon, color: 'text-purple-600' },
    { id: 'loyalty_points', name: 'Loyalty Points', icon: GiftIcon, color: 'text-yellow-600' }
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setShowPaymentForm(true);
  };

  const handleCashPayment = () => {
    const received = parseFloat(cashReceived);
    if (received < total) {
      alert('Insufficient cash received');
      return;
    }

    onPayment({
      method: 'cash',
      amount: total,
      received: received,
      change: received - total
    });
  };

  const handleCardPayment = () => {
    if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
      alert('Please fill in all card details');
      return;
    }

    onPayment({
      method: 'card',
      amount: total,
      cardData
    });
  };

  const handleMobilePayment = () => {
    onPayment({
      method: 'mobile',
      amount: total
    });
  };

  const handleLoyaltyPointsPayment = () => {
    const points = parseInt(loyaltyPoints);
    if (points < total * 100) { // Assuming 1 point = $0.01
      alert('Insufficient loyalty points');
      return;
    }

    onPayment({
      method: 'loyalty_points',
      amount: total,
      pointsUsed: points
    });
  };

  const resetForm = () => {
    setSelectedMethod('');
    setCashReceived('');
    setCardData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setLoyaltyPoints('');
    setShowPaymentForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Payment Amount */}
      <div className="text-center">
        <div className="payment-amount text-3xl font-bold text-gray-900">
          ${total.toFixed(2)}
        </div>
      </div>

      {/* Payment Methods */}
      {!showPaymentForm ? (
        <div className="payment-methods grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className="payment-method p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 ${method.color}`} />
                <p className="text-sm font-medium">{method.name}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payment Form Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">
              {paymentMethods.find(m => m.id === selectedMethod)?.name} Payment
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Cash Payment Form */}
          {selectedMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Amount Received</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="payment-input"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              {cashReceived && parseFloat(cashReceived) >= total && (
                <div className="text-center text-green-600 font-semibold">
                  Change: ${(parseFloat(cashReceived) - total).toFixed(2)}
                </div>
              )}
              <button
                onClick={handleCashPayment}
                disabled={!cashReceived || parseFloat(cashReceived) < total || isProcessing}
                className="btn btn-success w-full"
              >
                {isProcessing ? 'Processing...' : 'Complete Cash Payment'}
              </button>
            </div>
          )}

          {/* Card Payment Form */}
          {selectedMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                  className="form-input"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
                    className="form-input"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="form-label">CVV</label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    className="form-input"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                  className="form-input"
                  placeholder="John Doe"
                />
              </div>
              <button
                onClick={handleCardPayment}
                disabled={isProcessing}
                className="btn btn-primary w-full"
              >
                {isProcessing ? 'Processing...' : 'Process Card Payment'}
              </button>
            </div>
          )}

          {/* Mobile Payment Form */}
          {selectedMethod === 'mobile' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Mobile payment will be processed through your mobile wallet
                </p>
                <button
                  onClick={handleMobilePayment}
                  disabled={isProcessing}
                  className="btn btn-primary w-full"
                >
                  {isProcessing ? 'Processing...' : 'Process Mobile Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Loyalty Points Payment Form */}
          {selectedMethod === 'loyalty_points' && (
            <div className="space-y-4">
              <div>
                <label className="form-label">Loyalty Points</label>
                <input
                  type="number"
                  value={loyaltyPoints}
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  className="form-input"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Required: {Math.ceil(total * 100)} points (1 point = $0.01)
                </p>
              </div>
              {loyaltyPoints && parseInt(loyaltyPoints) >= total * 100 && (
                <div className="text-center text-green-600 font-semibold">
                  Points Remaining: {parseInt(loyaltyPoints) - Math.ceil(total * 100)}
                </div>
              )}
              <button
                onClick={handleLoyaltyPointsPayment}
                disabled={!loyaltyPoints || parseInt(loyaltyPoints) < total * 100 || isProcessing}
                className="btn btn-warning w-full"
              >
                {isProcessing ? 'Processing...' : 'Redeem Points'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentProcessor;
