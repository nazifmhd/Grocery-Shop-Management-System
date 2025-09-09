# Grocery Shop Management System - API Documentation

## Overview

The Grocery Shop Management System provides a comprehensive REST API for managing inventory, sales, customers, and business operations. The API is built with FastAPI and includes advanced AI features powered by CrewAI, LangGraph, and Phidata/MemGPT.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.grocery-shop.com`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Core Endpoints

### 1. Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password",
  "email": "user@example.com",
  "full_name": "New User"
}
```

### 2. Products

#### Get All Products
```http
GET /products?page=1&limit=20&category_id=uuid&search=query
```

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Organic Apples",
      "description": "Fresh organic apples",
      "sku": "APP001",
      "barcode": "1234567890123",
      "cost_price": 2.50,
      "selling_price": 3.99,
      "current_stock": 100,
      "min_stock_level": 10,
      "max_stock_level": 200,
      "category": {
        "id": "uuid",
        "name": "Fruits"
      },
      "supplier": {
        "id": "uuid",
        "name": "Fresh Farms"
      },
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

#### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "Organic Bananas",
  "description": "Fresh organic bananas",
  "sku": "BAN001",
  "barcode": "1234567890124",
  "cost_price": 1.50,
  "selling_price": 2.99,
  "current_stock": 50,
  "min_stock_level": 5,
  "max_stock_level": 100,
  "category_id": "uuid",
  "supplier_id": "uuid"
}
```

#### Update Product
```http
PUT /products/{product_id}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "selling_price": 4.99
}
```

#### Delete Product
```http
DELETE /products/{product_id}
```

### 3. Inventory Management

#### Update Stock
```http
POST /inventory/stock/update
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 25,
  "movement_type": "restock",
  "reason": "Weekly restock",
  "location_id": "uuid"
}
```

#### Get Stock Levels
```http
GET /inventory/stock?product_id=uuid&location_id=uuid&low_stock=true
```

#### Get Low Stock Alerts
```http
GET /inventory/alerts/low-stock
```

### 4. Sales

#### Create Sale Transaction
```http
POST /sales/transactions
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 3.99
    }
  ],
  "customer_id": "uuid",
  "payment_method": "card",
  "discount_amount": 0.50,
  "location_id": "uuid"
}
```

#### Get Sales History
```http
GET /sales/transactions?start_date=2024-01-01&end_date=2024-01-31&page=1&limit=20
```

#### Process Return
```http
POST /sales/transactions/{transaction_id}/return
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1,
      "reason": "defective"
    }
  ]
}
```

### 5. Customers

#### Get All Customers
```http
GET /customers?page=1&limit=20&search=query
```

#### Create Customer
```http
POST /customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345",
  "loyalty_tier": "gold"
}
```

#### Update Customer
```http
PUT /customers/{customer_id}
Content-Type: application/json

{
  "name": "John Smith",
  "loyalty_tier": "platinum"
}
```

### 6. Analytics

#### Get Sales Analytics
```http
GET /analytics/sales?period=monthly&start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "total_sales": 50000.00,
  "total_transactions": 1250,
  "average_transaction_value": 40.00,
  "top_products": [
    {
      "product_id": "uuid",
      "name": "Organic Apples",
      "quantity_sold": 500,
      "revenue": 1995.00
    }
  ],
  "sales_by_day": [
    {
      "date": "2024-01-01",
      "sales": 1500.00,
      "transactions": 45
    }
  ]
}
```

#### Get Inventory Analytics
```http
GET /analytics/inventory?location_id=uuid
```

#### Get Customer Analytics
```http
GET /analytics/customers?segment=high_value
```

## AI-Powered Endpoints

### 1. CrewAI Agents

#### Inventory Optimization
```http
POST /ai/crew/inventory-optimization
Content-Type: application/json

{
  "location_id": "uuid",
  "optimization_goals": ["minimize_waste", "maximize_turnover"]
}
```

#### Sales Optimization
```http
POST /ai/crew/sales-optimization
Content-Type: application/json

{
  "location_id": "uuid",
  "time_period": "weekly",
  "focus_areas": ["pricing", "promotions"]
}
```

### 2. LangGraph Workflows

#### Order Fulfillment Workflow
```http
POST /ai/workflows/order-fulfillment
Content-Type: application/json

{
  "order_id": "uuid",
  "customer_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

#### Inventory Optimization Workflow
```http
POST /ai/workflows/inventory-optimization
Content-Type: application/json

{
  "location_id": "uuid",
  "optimization_type": "reorder_points"
}
```

### 3. Phidata Memory

#### Store Customer Memory
```http
POST /ai/memory/customers
Content-Type: application/json

{
  "customer_id": "uuid",
  "memory_type": "preference",
  "content": "Customer prefers organic products"
}
```

#### Get Customer Memory
```http
GET /ai/memory/customers/{customer_id}?memory_type=preference
```

#### Store Business Intelligence
```http
POST /ai/memory/business
Content-Type: application/json

{
  "intelligence_type": "market_trend",
  "content": "Organic products showing 20% growth",
  "metadata": {
    "source": "sales_data",
    "confidence": 0.85
  }
}
```

### 4. Advanced AI Features

#### Demand Prediction
```http
POST /ai/predictions/demand
Content-Type: application/json

{
  "product_id": "uuid",
  "forecast_days": 30,
  "location_id": "uuid"
}
```

#### Dynamic Pricing
```http
POST /ai/pricing/optimize
Content-Type: application/json

{
  "product_id": "uuid",
  "current_price": 3.99,
  "competitor_prices": [3.50, 4.25],
  "demand_factor": 1.2
}
```

#### Product Recommendations
```http
POST /ai/recommendations/products
Content-Type: application/json

{
  "customer_id": "uuid",
  "limit": 10,
  "context": "purchase_history"
}
```

#### Sentiment Analysis
```http
POST /ai/analysis/sentiment
Content-Type: application/json

{
  "text": "Great product, highly recommend!",
  "source": "customer_review"
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 1000 requests per hour per user
- **AI Endpoints**: 100 requests per hour per user
- **Bulk Operations**: 10 requests per hour per user

## Pagination

All list endpoints support pagination:

```
GET /products?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

## Filtering and Sorting

### Filtering
```
GET /products?category_id=uuid&is_active=true&min_price=10&max_price=50
```

### Sorting
```
GET /products?sort_by=name&sort_order=asc
GET /products?sort_by=created_at&sort_order=desc
```

## Webhooks

### Available Webhooks

- `inventory.low_stock` - Triggered when stock falls below minimum level
- `sales.transaction_completed` - Triggered when a sale is completed
- `customer.loyalty_tier_changed` - Triggered when customer loyalty tier changes

### Webhook Payload

```json
{
  "event": "inventory.low_stock",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "product_id": "uuid",
    "product_name": "Organic Apples",
    "current_stock": 5,
    "min_stock_level": 10,
    "location_id": "uuid"
  }
}
```

## SDKs and Libraries

### Python
```python
from grocery_shop_sdk import GroceryShopClient

client = GroceryShopClient(api_key="your_api_key")
products = client.products.list()
```

### JavaScript
```javascript
import { GroceryShopClient } from 'grocery-shop-sdk';

const client = new GroceryShopClient('your_api_key');
const products = await client.products.list();
```

## Testing

### Test Environment

- **Base URL**: `https://api-test.grocery-shop.com`
- **Test Data**: Automatically cleaned up after 24 hours
- **Rate Limits**: 10x higher than production

### Postman Collection

Import the Postman collection from `/docs/postman_collection.json` for easy API testing.

## Support

- **Documentation**: https://docs.grocery-shop.com
- **Status Page**: https://status.grocery-shop.com
- **Support Email**: support@grocery-shop.com
- **GitHub Issues**: https://github.com/your-org/grocery-shop-system/issues
