import React, { useState } from 'react';
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'hardware', name: 'Hardware', icon: PrinterIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'payments':
        return <PaymentSettings />;
      case 'hardware':
        return <HardwareSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your system preferences and configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
    
    <div className="space-y-6">
      <div className="form-group">
        <label className="form-label">Store Name</label>
        <input
          type="text"
          defaultValue="Grocery Store"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Store Address</label>
        <textarea
          defaultValue="123 Main Street, City, State 12345"
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            defaultValue="(555) 123-4567"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            defaultValue="info@grocerystore.com"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Currency</label>
        <select className="form-select">
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Tax Rate (%)</label>
        <input
          type="number"
          step="0.01"
          defaultValue="10.00"
          className="form-input"
        />
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
);

// Profile Settings Component
const ProfileSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
    
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
          <UserIcon className="h-10 w-10 text-gray-400" />
        </div>
        <div>
          <button className="btn btn-secondary btn-sm">Change Photo</button>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            defaultValue="John"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            defaultValue="Doe"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          defaultValue="john.doe@grocerystore.com"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Role</label>
        <select className="form-select">
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
          <option value="inventory">Inventory Clerk</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
);

// Notification Settings Component
const NotificationSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
    
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Email Notifications</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
            <p className="text-sm text-gray-500">Get notified when products are running low</p>
          </div>
          <input type="checkbox" defaultChecked className="form-checkbox" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Daily Sales Reports</p>
            <p className="text-sm text-gray-500">Receive daily sales summary reports</p>
          </div>
          <input type="checkbox" defaultChecked className="form-checkbox" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">System Alerts</p>
            <p className="text-sm text-gray-500">Important system notifications</p>
          </div>
          <input type="checkbox" defaultChecked className="form-checkbox" />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Push Notifications</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">New Orders</p>
            <p className="text-sm text-gray-500">Notify about new online orders</p>
          </div>
          <input type="checkbox" className="form-checkbox" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Payment Issues</p>
            <p className="text-sm text-gray-500">Alert about payment processing issues</p>
          </div>
          <input type="checkbox" defaultChecked className="form-checkbox" />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  </div>
);

// Security Settings Component
const SecuritySettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
    
    <div className="space-y-6">
      <div className="form-group">
        <label className="form-label">Current Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="Enter current password"
        />
      </div>

      <div className="form-group">
        <label className="form-label">New Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="Enter new password"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Confirm New Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="Confirm new password"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
            <p className="text-sm text-gray-500">Add an extra layer of security</p>
          </div>
          <input type="checkbox" className="form-checkbox" />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Update Security</button>
      </div>
    </div>
  </div>
);

// Payment Settings Component
const PaymentSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h3>
    
    <div className="space-y-6">
      <div className="form-group">
        <label className="form-label">Stripe Secret Key</label>
        <input
          type="password"
          defaultValue="sk_test_..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Stripe Publishable Key</label>
        <input
          type="text"
          defaultValue="pk_test_..."
          className="form-input"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Payment Methods</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Credit/Debit Cards</span>
            <input type="checkbox" defaultChecked className="form-checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Cash</span>
            <input type="checkbox" defaultChecked className="form-checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Mobile Payments</span>
            <input type="checkbox" className="form-checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Loyalty Points</span>
            <input type="checkbox" defaultChecked className="form-checkbox" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Save Payment Settings</button>
      </div>
    </div>
  </div>
);

// Hardware Settings Component
const HardwareSettings = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Hardware Settings</h3>
    
    <div className="space-y-6">
      <div className="form-group">
        <label className="form-label">Receipt Printer IP</label>
        <input
          type="text"
          defaultValue="192.168.1.100"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Cash Drawer Port</label>
        <input
          type="text"
          defaultValue="COM3"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Barcode Scanner Port</label>
        <input
          type="text"
          defaultValue="COM4"
          className="form-input"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Hardware Status</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Receipt Printer</span>
            <span className="text-sm text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Cash Drawer</span>
            <span className="text-sm text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">Barcode Scanner</span>
            <span className="text-sm text-yellow-600">Disconnected</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Test Hardware</button>
      </div>
    </div>
  </div>
);

export default Settings;
