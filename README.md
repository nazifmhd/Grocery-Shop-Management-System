# 🛒 **Grocery Shop Management System - AI-Powered**

A comprehensive, AI-powered grocery shop management system built with **CrewAI**, **LangGraph**, and **Phidata/MemGPT** for advanced multi-agent collaboration, workflow orchestration, and intelligent memory management.

## 🚀 **Key Features**

### **🤖 Advanced AI Integration**
- **CrewAI**: Multi-agent system with specialized roles (Inventory Manager, Sales Associate, Customer Service, etc.)
- **LangGraph**: Complex workflow orchestration for business processes
- **Phidata/MemGPT**: Persistent memory and knowledge management
- **Predictive Analytics**: AI-powered demand forecasting and pricing optimization
- **Customer Segmentation**: Intelligent customer analysis and targeting

### **🏪 Core Business Features**
- **Real-time Inventory Management**: Live stock tracking with AI-powered reorder points
- **Advanced POS System**: Barcode scanning, multiple payment methods, receipt printing
- **Customer Management**: Loyalty programs, purchase history, personalized recommendations
- **Supplier Management**: Automated purchase orders and delivery tracking
- **Analytics Dashboard**: Comprehensive business intelligence and reporting

### **💡 AI-Powered Capabilities**
- **Demand Prediction**: Machine learning models for accurate demand forecasting
- **Dynamic Pricing**: AI-optimized pricing strategies based on market conditions
- **Customer Sentiment Analysis**: Real-time feedback analysis and insights
- **Churn Prediction**: Identify at-risk customers and retention strategies
- **Intelligent Recommendations**: Personalized product and business recommendations

## 🏗️ **Architecture**

### **Technology Stack**
- **Backend**: FastAPI with Python 3.12
- **Frontend**: React 18 with TypeScript and Vite
- **Database**: PostgreSQL with vector extensions
- **AI/ML**: CrewAI, LangGraph, Phidata, MemGPT, OpenAI, Google Gemini
- **Caching**: Redis for session management and background tasks
- **Containerization**: Docker & Docker Compose
- **Monitoring**: Prometheus, Grafana, Flower (Celery monitoring)

### **AI Components**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    CrewAI       │    │   LangGraph     │    │  Phidata/MemGPT │
│   Multi-Agent   │    │   Workflows     │    │   Memory &      │
│   System        │    │   Orchestration │    │   Knowledge     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Advanced AI    │
                    │   Features      │
                    │  (Predictions,  │
                    │  Analytics,     │
                    │  Optimization)  │
                    └─────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites**
- Docker and Docker Compose
- Python 3.12+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### **1. Clone and Setup**
```bash
git clone <your-repo-url> grocery-management-system
cd grocery-management-system

# Copy environment variables
cp env.example .env
# Edit .env with your API keys and configuration
```

### **2. Start with Docker Compose**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **3. Manual Setup (Development)**

#### **Backend Setup**
```bash
cd backend-python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install uv
uv pip install -e .

# Start the server
python multi_agent_server.py
```

#### **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### **Database Setup**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
cd backend-python
alembic upgrade head
```

## 🔧 **Configuration**

### **Required Environment Variables**

#### **AI Services**
```bash
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
LANGSMITH_API_KEY=your_langsmith_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

#### **Database**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/grocery_management
REDIS_URL=redis://localhost:6379
```

#### **Payment Processing**
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 📊 **API Endpoints**

### **CrewAI Operations**
- `POST /crew/optimize-inventory` - Run inventory optimization
- `POST /crew/optimize-sales` - Run sales optimization
- `POST /crew/manage-operations` - Run operations management

### **LangGraph Workflows**
- `POST /workflow/order-fulfillment` - Execute order fulfillment workflow
- `POST /workflow/inventory-optimization` - Execute inventory optimization workflow
- `POST /workflow/customer-service` - Execute customer service workflow

### **Phidata Memory**
- `POST /memory/store-customer-interaction` - Store customer interaction
- `GET /memory/customer-context/{customer_id}` - Get customer context
- `POST /memory/product-recommendations` - Get AI recommendations

### **Advanced AI Features**
- `POST /ai/predict-demand` - Predict product demand
- `POST /ai/optimize-pricing` - Optimize product pricing
- `POST /ai/segment-customers` - Segment customers using AI
- `POST /ai/generate-recommendations` - Generate business recommendations
- `POST /ai/analyze-sentiment` - Analyze customer sentiment
- `POST /ai/predict-churn` - Predict customer churn risk

## 🤖 **AI Agent Roles**

### **CrewAI Agents**
1. **Inventory Management Specialist**: Optimizes stock levels and prevents stockouts
2. **Sales and Customer Experience Specialist**: Maximizes revenue and customer satisfaction
3. **Financial and Pricing Analyst**: Optimizes pricing strategies and profit margins
4. **Operations and Logistics Coordinator**: Streamlines operations and supply chain
5. **AI Analytics and Insights Specialist**: Provides business intelligence and predictions

### **LangGraph Workflows**
1. **Order Fulfillment**: Complete order processing workflow
2. **Inventory Optimization**: Automated inventory management workflow
3. **Customer Service**: Intelligent customer support workflow
4. **Dynamic Pricing**: AI-powered pricing optimization workflow
5. **Supply Chain Management**: End-to-end supply chain workflow

### **Phidata/MemGPT Agents**
1. **Customer Relationship Manager**: Persistent customer relationship management
2. **Inventory Management Specialist**: Long-term inventory optimization memory
3. **Business Intelligence Analyst**: Strategic business insights and recommendations

## 📈 **Advanced Features**

### **Predictive Analytics**
- **Demand Forecasting**: ML models predict product demand 30+ days ahead
- **Price Optimization**: Dynamic pricing based on market conditions and elasticity
- **Customer Segmentation**: AI-powered customer clustering and targeting
- **Churn Prediction**: Identify at-risk customers with retention strategies

### **Intelligent Automation**
- **Automated Reordering**: AI determines optimal reorder points and quantities
- **Dynamic Pricing**: Real-time price adjustments based on demand and competition
- **Personalized Recommendations**: AI-powered product and business recommendations
- **Sentiment Analysis**: Real-time customer feedback analysis and insights

### **Memory and Knowledge Management**
- **Persistent Customer Memory**: Long-term customer relationship tracking
- **Product Knowledge Base**: Comprehensive product information and performance data
- **Business Intelligence**: Historical analysis and trend identification
- **Contextual Recommendations**: Memory-aware personalized suggestions

## 🔍 **Monitoring and Observability**

### **Health Checks**
- `GET /health` - System health status
- `GET /` - System information and component status

### **Monitoring Stack**
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Flower**: Celery task monitoring
- **Structured Logging**: Comprehensive application logging

### **Access Monitoring**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)
- Flower: http://localhost:5555

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend-python
python -m pytest tests/ -v
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

### **Integration Testing**
```bash
# Test AI components
curl -X POST http://localhost:8000/ai/predict-demand \
  -H "Content-Type: application/json" \
  -d '{"product_id": "test_product", "days_ahead": 30}'
```

## 🚀 **Deployment**

### **Production Deployment**
```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy with monitoring
docker-compose --profile production --profile monitoring up -d
```

### **AWS Deployment**
```bash
# Deploy to AWS ECS
aws ecs update-service --cluster grocery-cluster --service grocery-backend --force-new-deployment
```

## 📚 **Documentation**

### **API Documentation**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### **Component Documentation**
- [CrewAI Agents](./docs/crewai-agents.md)
- [LangGraph Workflows](./docs/langgraph-workflows.md)
- [Phidata Memory](./docs/phidata-memory.md)
- [Advanced AI Features](./docs/advanced-ai-features.md)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions for questions and ideas

## 🎯 **Roadmap**

### **Phase 1: Core AI Integration** ✅
- [x] CrewAI multi-agent system
- [x] LangGraph workflow orchestration
- [x] Phidata/MemGPT memory management
- [x] Advanced AI features

### **Phase 2: Enhanced Features** 🚧
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Third-party integrations

### **Phase 3: Enterprise Features** 📋
- [ ] Advanced security features
- [ ] Multi-tenant architecture
- [ ] Advanced reporting
- [ ] API marketplace

---

**Built with ❤️ using CrewAI, LangGraph, and Phidata/MemGPT for the most advanced grocery management system available.**