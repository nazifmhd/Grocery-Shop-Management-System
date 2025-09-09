# Grocery Shop Management System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Grocery Shop Management System to AWS using Docker containers and ECS.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker and Docker Compose installed
- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL 15+ with pgvector extension
- Redis 7+

## Local Development Setup

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Grocery-Shop-Management-System
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 3. Database Setup

```bash
# Start PostgreSQL with pgvector
docker-compose up -d postgres redis

# Run database migrations
cd backend-python
alembic upgrade head
```

### 4. Start Development Servers

```bash
# Backend
cd backend-python
pip install -e .
uvicorn multi_agent_server:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Mobile (optional)
cd mobile-app
npm install
npx expo start
```

## AWS Deployment

### 1. Infrastructure Setup

```bash
# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name grocery-shop-system \
  --template-body file://aws/cloudformation/infrastructure.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=Environment,ParameterValue=production
```

### 2. Database Setup

```bash
# Connect to RDS instance
psql -h <rds-endpoint> -U postgres -d grocery_shop

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Run migrations
cd backend-python
alembic upgrade head
```

### 3. Container Registry

```bash
# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build backend
docker build -t grocery-shop-backend ./backend-python
docker tag grocery-shop-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/grocery-shop-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/grocery-shop-backend:latest

# Build frontend
docker build -t grocery-shop-frontend ./frontend
docker tag grocery-shop-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/grocery-shop-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/grocery-shop-frontend:latest
```

### 4. ECS Service Deployment

```bash
# Update ECS service with new image
aws ecs update-service \
  --cluster grocery-shop-cluster \
  --service grocery-shop-backend-service \
  --force-new-deployment

aws ecs update-service \
  --cluster grocery-shop-cluster \
  --service grocery-shop-frontend-service \
  --force-new-deployment
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/grocery_shop
REDIS_URL=redis://localhost:6379

# AI Services
GOOGLE_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Vector Databases
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Notifications
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Security
JWT_SECRET_KEY=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# Monitoring
PROMETHEUS_ENDPOINT=http://localhost:9090
GRAFANA_ENDPOINT=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Monitoring and Logging

### 1. Prometheus Setup

```bash
# Start Prometheus
docker run -d -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### 2. Grafana Setup

```bash
# Start Grafana
docker run -d -p 3000:3000 \
  -v $(pwd)/monitoring/grafana:/var/lib/grafana \
  grafana/grafana
```

### 3. Flower (Celery Monitoring)

```bash
# Start Flower
cd backend-python
celery -A celery_app flower --port=5555
```

## Security Configuration

### 1. Database Security

- Enable SSL connections
- Use strong passwords
- Restrict network access
- Regular security updates

### 2. API Security

- Enable CORS properly
- Use rate limiting
- Implement API key authentication
- Regular security audits

### 3. Container Security

- Use non-root users
- Scan images for vulnerabilities
- Keep base images updated
- Use secrets management

## Backup and Recovery

### 1. Database Backup

```bash
# Create backup
pg_dump -h <rds-endpoint> -U postgres grocery_shop > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h <rds-endpoint> -U postgres grocery_shop < backup_file.sql
```

### 2. Application Data Backup

```bash
# Backup vector databases
tar -czf chroma_backup_$(date +%Y%m%d_%H%M%S).tar.gz ./chroma_db

# Backup Redis data
redis-cli --rdb redis_backup_$(date +%Y%m%d_%H%M%S).rdb
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check RDS security groups
   - Verify connection string
   - Ensure pgvector extension is enabled

2. **AI Service Errors**
   - Verify API keys
   - Check rate limits
   - Monitor service status

3. **Container Issues**
   - Check ECS task logs
   - Verify environment variables
   - Monitor resource usage

### Log Locations

- **ECS Logs**: CloudWatch Logs
- **Application Logs**: `/var/log/grocery-shop/`
- **Database Logs**: RDS Performance Insights
- **Load Balancer Logs**: S3 bucket

## Performance Optimization

### 1. Database Optimization

- Enable connection pooling
- Use read replicas
- Optimize queries
- Regular VACUUM and ANALYZE

### 2. Application Optimization

- Enable caching
- Use CDN for static assets
- Optimize Docker images
- Monitor memory usage

### 3. Monitoring

- Set up alerts
- Monitor key metrics
- Regular performance reviews
- Capacity planning

## Scaling

### Horizontal Scaling

- Add more ECS tasks
- Use Application Load Balancer
- Implement auto-scaling
- Use read replicas

### Vertical Scaling

- Increase ECS task resources
- Upgrade RDS instance
- Add more Redis memory
- Optimize application code

## Maintenance

### Regular Tasks

- Security updates
- Database maintenance
- Log rotation
- Performance monitoring
- Backup verification

### Updates

- Test in staging environment
- Use blue-green deployment
- Monitor during updates
- Rollback plan ready

## Support

For issues and questions:

1. Check logs and monitoring
2. Review documentation
3. Check GitHub issues
4. Contact support team

## Cost Optimization

### AWS Cost Management

- Use reserved instances
- Monitor unused resources
- Implement auto-scaling
- Use spot instances for non-critical workloads

### Application Optimization

- Optimize database queries
- Use caching effectively
- Monitor resource usage
- Regular cleanup of old data
