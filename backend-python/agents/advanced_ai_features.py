"""
Advanced AI Features for Grocery Shop Management System
Predictive analytics, automated decision making, and intelligent recommendations
"""

from typing import Dict, List, Any, Optional, Tuple
import asyncio
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import os
from dataclasses import dataclass
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# AI/ML imports
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from sentence_transformers import SentenceTransformer

# Custom imports
from .crew_agents import GroceryCrewAI
from .langgraph_workflows import GroceryLangGraphWorkflows
from .phidata_memory import GroceryMemoryManager

@dataclass
class PredictionResult:
    """Result of AI prediction"""
    value: float
    confidence: float
    factors: List[str]
    timestamp: datetime
    model_used: str

@dataclass
class Recommendation:
    """AI-generated recommendation"""
    type: str  # product, pricing, inventory, marketing
    title: str
    description: str
    confidence: float
    expected_impact: str
    implementation_effort: str
    priority: int  # 1-5, 5 being highest

@dataclass
class CustomerSegment:
    """Customer segmentation result"""
    segment_id: str
    name: str
    characteristics: Dict[str, Any]
    size: int
    value: float
    recommendations: List[str]

class AdvancedAIFeatures:
    """Advanced AI features for grocery management"""
    
    def __init__(self):
        self.crew_ai = GroceryCrewAI()
        self.langgraph_workflows = GroceryLangGraphWorkflows()
        self.memory_manager = GroceryMemoryManager()
        
        # Initialize ML models
        self.demand_forecasting_model = None
        self.price_optimization_model = None
        self.customer_segmentation_model = None
        self.sentiment_analyzer = None
        self.recommendation_engine = None
        
        # Initialize transformers
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI/ML models"""
        try:
            # Sentiment analysis model
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest"
            )
            
            # Sentence transformer for embeddings
            self.sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize ML models
            self.demand_forecasting_model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            
            self.price_optimization_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            self.customer_segmentation_model = KMeans(
                n_clusters=5,
                random_state=42
            )
            
            self.scaler = StandardScaler()
            
        except Exception as e:
            print(f"Error initializing models: {e}")
    
    async def predict_demand_with_ai(self, product_id: str, days_ahead: int = 30) -> PredictionResult:
        """Advanced demand prediction using multiple AI models"""
        try:
            # Get historical data
            historical_data = await self._get_historical_sales_data(product_id)
            
            if not historical_data:
                return PredictionResult(
                    value=0.0,
                    confidence=0.0,
                    factors=["No historical data available"],
                    timestamp=datetime.now(),
                    model_used="default"
                )
            
            # Prepare features
            features = self._prepare_demand_features(historical_data)
            
            # Train model if needed
            if not hasattr(self.demand_forecasting_model, 'feature_importances_'):
                self._train_demand_model(historical_data)
            
            # Make prediction
            prediction = self.demand_forecasting_model.predict([features])[0]
            
            # Calculate confidence based on model performance
            confidence = self._calculate_prediction_confidence(historical_data, features)
            
            # Identify key factors
            factors = self._identify_demand_factors(features)
            
            # Use LangGraph workflow for complex demand analysis
            workflow_result = await self.langgraph_workflows.execute_inventory_optimization(
                store_id="main_store"
            )
            
            # Use CrewAI for collaborative analysis
            crew_result = await self.crew_ai.optimize_inventory(store_id="main_store")
            
            # Use Phidata memory for context
            memory_context = await self.memory_manager.predict_demand(product_id, days_ahead)
            
            return PredictionResult(
                value=max(0, prediction),
                confidence=confidence,
                factors=factors,
                timestamp=datetime.now(),
                model_used="ensemble_gradient_boosting"
            )
            
        except Exception as e:
            print(f"Error in demand prediction: {e}")
            return PredictionResult(
                value=0.0,
                confidence=0.0,
                factors=[f"Error: {str(e)}"],
                timestamp=datetime.now(),
                model_used="error"
            )
    
    async def optimize_pricing_with_ai(self, product_id: str, current_price: float) -> Dict[str, Any]:
        """AI-powered dynamic pricing optimization"""
        try:
            # Get product and market data
            product_data = await self._get_product_data(product_id)
            market_data = await self._get_market_data(product_id)
            competitor_data = await self._get_competitor_pricing(product_id)
            
            # Prepare features for pricing model
            pricing_features = self._prepare_pricing_features(
                product_data, market_data, competitor_data, current_price
            )
            
            # Train pricing model if needed
            if not hasattr(self.price_optimization_model, 'feature_importances_'):
                self._train_pricing_model()
            
            # Predict optimal price
            optimal_price = self.price_optimization_model.predict([pricing_features])[0]
            
            # Calculate price elasticity
            elasticity = self._calculate_price_elasticity(product_id, current_price)
            
            # Generate pricing strategy
            pricing_strategy = await self._generate_pricing_strategy(
                product_id, current_price, optimal_price, elasticity
            )
            
            # Use LangGraph workflow for pricing optimization
            workflow_result = await self.langgraph_workflows.workflows["dynamic_pricing"].ainvoke({
                "messages": [],
                "current_step": "start",
                "data": {
                    "product_id": product_id,
                    "current_price": current_price,
                    "optimal_price": optimal_price
                },
                "errors": [],
                "results": {}
            })
            
            return {
                "product_id": product_id,
                "current_price": current_price,
                "recommended_price": optimal_price,
                "price_change_percentage": ((optimal_price - current_price) / current_price) * 100,
                "elasticity": elasticity,
                "strategy": pricing_strategy,
                "confidence": self._calculate_pricing_confidence(pricing_features),
                "workflow_result": workflow_result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in pricing optimization: {e}")
            return {
                "product_id": product_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def segment_customers_with_ai(self, store_id: str) -> List[CustomerSegment]:
        """AI-powered customer segmentation"""
        try:
            # Get customer data
            customer_data = await self._get_customer_data(store_id)
            
            if not customer_data:
                return []
            
            # Prepare features for clustering
            features = self._prepare_customer_features(customer_data)
            
            # Normalize features
            features_scaled = self.scaler.fit_transform(features)
            
            # Perform clustering
            cluster_labels = self.customer_segmentation_model.fit_predict(features_scaled)
            
            # Analyze clusters
            segments = []
            for cluster_id in range(self.customer_segmentation_model.n_clusters):
                cluster_customers = [customer_data[i] for i, label in enumerate(cluster_labels) if label == cluster_id]
                
                if not cluster_customers:
                    continue
                
                # Calculate segment characteristics
                characteristics = self._analyze_cluster_characteristics(cluster_customers)
                
                # Generate segment name
                segment_name = self._generate_segment_name(characteristics)
                
                # Calculate segment value
                segment_value = sum(customer.get('lifetime_value', 0) for customer in cluster_customers)
                
                # Generate recommendations
                recommendations = await self._generate_segment_recommendations(
                    characteristics, cluster_customers
                )
                
                segments.append(CustomerSegment(
                    segment_id=f"segment_{cluster_id}",
                    name=segment_name,
                    characteristics=characteristics,
                    size=len(cluster_customers),
                    value=segment_value,
                    recommendations=recommendations
                ))
            
            # Store segments in memory
            await self.memory_manager.store_customer_interaction(
                "system",
                {
                    "type": "customer_segmentation",
                    "segments": [segment.__dict__ for segment in segments],
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return segments
            
        except Exception as e:
            print(f"Error in customer segmentation: {e}")
            return []
    
    async def generate_intelligent_recommendations(self, context: Dict[str, Any]) -> List[Recommendation]:
        """Generate intelligent business recommendations using AI"""
        try:
            recommendations = []
            
            # Analyze current business state
            business_state = await self._analyze_business_state(context)
            
            # Generate different types of recommendations
            product_recommendations = await self._generate_product_recommendations(business_state)
            pricing_recommendations = await self._generate_pricing_recommendations(business_state)
            inventory_recommendations = await self._generate_inventory_recommendations(business_state)
            marketing_recommendations = await self._generate_marketing_recommendations(business_state)
            
            # Combine all recommendations
            all_recommendations = (
                product_recommendations + 
                pricing_recommendations + 
                inventory_recommendations + 
                marketing_recommendations
            )
            
            # Rank recommendations by priority
            ranked_recommendations = self._rank_recommendations(all_recommendations, business_state)
            
            # Use CrewAI for collaborative recommendation analysis
            crew_result = await self.crew_ai.optimize_sales(store_id=context.get("store_id", "main_store"))
            
            # Store recommendations in memory
            await self.memory_manager.store_customer_interaction(
                "system",
                {
                    "type": "intelligent_recommendations",
                    "recommendations": [rec.__dict__ for rec in ranked_recommendations],
                    "context": context,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return ranked_recommendations[:10]  # Return top 10 recommendations
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return []
    
    async def analyze_customer_sentiment(self, customer_id: str, text_data: List[str]) -> Dict[str, Any]:
        """Analyze customer sentiment using AI"""
        try:
            if not text_data:
                return {"sentiment": "neutral", "confidence": 0.0, "analysis": "No text data provided"}
            
            # Analyze sentiment for each text
            sentiment_results = []
            for text in text_data:
                if text.strip():
                    result = self.sentiment_analyzer(text)
                    sentiment_results.append(result[0])
            
            if not sentiment_results:
                return {"sentiment": "neutral", "confidence": 0.0, "analysis": "No valid text data"}
            
            # Aggregate sentiment results
            sentiments = [result['label'] for result in sentiment_results]
            confidences = [result['score'] for result in sentiment_results]
            
            # Calculate overall sentiment
            positive_count = sentiments.count('LABEL_2')  # Positive
            negative_count = sentiments.count('LABEL_0')  # Negative
            neutral_count = sentiments.count('LABEL_1')  # Neutral
            
            if positive_count > negative_count and positive_count > neutral_count:
                overall_sentiment = "positive"
            elif negative_count > positive_count and negative_count > neutral_count:
                overall_sentiment = "negative"
            else:
                overall_sentiment = "neutral"
            
            overall_confidence = np.mean(confidences)
            
            # Generate insights
            insights = self._generate_sentiment_insights(sentiment_results, overall_sentiment)
            
            # Store sentiment analysis in memory
            await self.memory_manager.store_customer_interaction(
                customer_id,
                {
                    "type": "sentiment_analysis",
                    "sentiment": overall_sentiment,
                    "confidence": overall_confidence,
                    "insights": insights,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return {
                "customer_id": customer_id,
                "sentiment": overall_sentiment,
                "confidence": overall_confidence,
                "detailed_results": sentiment_results,
                "insights": insights,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in sentiment analysis: {e}")
            return {
                "customer_id": customer_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def predict_churn_risk(self, customer_id: str) -> Dict[str, Any]:
        """Predict customer churn risk using AI"""
        try:
            # Get customer data
            customer_data = await self._get_customer_profile(customer_id)
            
            if not customer_data:
                return {"customer_id": customer_id, "churn_risk": "unknown", "confidence": 0.0}
            
            # Prepare features for churn prediction
            features = self._prepare_churn_features(customer_data)
            
            # Use a simple rule-based approach (can be enhanced with ML model)
            churn_score = self._calculate_churn_score(features)
            
            # Determine risk level
            if churn_score >= 0.7:
                risk_level = "high"
            elif churn_score >= 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            # Generate retention recommendations
            retention_strategies = await self._generate_retention_strategies(customer_data, churn_score)
            
            return {
                "customer_id": customer_id,
                "churn_risk": risk_level,
                "churn_score": churn_score,
                "confidence": 0.8,  # Placeholder
                "retention_strategies": retention_strategies,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in churn prediction: {e}")
            return {
                "customer_id": customer_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    # Helper methods
    async def _get_historical_sales_data(self, product_id: str) -> List[Dict[str, Any]]:
        """Get historical sales data for a product"""
        # Implementation to fetch from database
        return []
    
    def _prepare_demand_features(self, historical_data: List[Dict[str, Any]]) -> List[float]:
        """Prepare features for demand forecasting"""
        # Implementation to extract features from historical data
        return [0.0] * 10  # Placeholder
    
    def _train_demand_model(self, historical_data: List[Dict[str, Any]]):
        """Train demand forecasting model"""
        # Implementation to train the model
        pass
    
    def _calculate_prediction_confidence(self, historical_data: List[Dict[str, Any]], features: List[float]) -> float:
        """Calculate confidence in prediction"""
        # Implementation to calculate confidence
        return 0.8  # Placeholder
    
    def _identify_demand_factors(self, features: List[float]) -> List[str]:
        """Identify key factors affecting demand"""
        # Implementation to identify factors
        return ["seasonal trends", "promotional activity", "competitor pricing"]
    
    async def _get_product_data(self, product_id: str) -> Dict[str, Any]:
        """Get product data"""
        return {}
    
    async def _get_market_data(self, product_id: str) -> Dict[str, Any]:
        """Get market data"""
        return {}
    
    async def _get_competitor_pricing(self, product_id: str) -> Dict[str, Any]:
        """Get competitor pricing data"""
        return {}
    
    def _prepare_pricing_features(self, product_data: Dict, market_data: Dict, 
                                competitor_data: Dict, current_price: float) -> List[float]:
        """Prepare features for pricing model"""
        return [0.0] * 15  # Placeholder
    
    def _train_pricing_model(self):
        """Train pricing optimization model"""
        pass
    
    def _calculate_price_elasticity(self, product_id: str, current_price: float) -> float:
        """Calculate price elasticity"""
        return -1.5  # Placeholder
    
    async def _generate_pricing_strategy(self, product_id: str, current_price: float, 
                                       optimal_price: float, elasticity: float) -> Dict[str, Any]:
        """Generate pricing strategy"""
        return {
            "strategy": "gradual_increase",
            "timeline": "2_weeks",
            "monitoring_period": "1_month"
        }
    
    def _calculate_pricing_confidence(self, features: List[float]) -> float:
        """Calculate confidence in pricing recommendation"""
        return 0.85  # Placeholder
    
    async def _get_customer_data(self, store_id: str) -> List[Dict[str, Any]]:
        """Get customer data for segmentation"""
        return []
    
    def _prepare_customer_features(self, customer_data: List[Dict[str, Any]]) -> List[List[float]]:
        """Prepare features for customer segmentation"""
        return [[0.0] * 8 for _ in customer_data]  # Placeholder
    
    def _analyze_cluster_characteristics(self, cluster_customers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze characteristics of a customer cluster"""
        return {
            "avg_purchase_frequency": 2.5,
            "avg_order_value": 45.0,
            "preferred_categories": ["dairy", "produce"],
            "loyalty_level": "medium"
        }
    
    def _generate_segment_name(self, characteristics: Dict[str, Any]) -> str:
        """Generate name for customer segment"""
        return "Value-Conscious Families"
    
    async def _generate_segment_recommendations(self, characteristics: Dict[str, Any], 
                                              customers: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for customer segment"""
        return [
            "Offer family-size discounts",
            "Promote healthy products",
            "Send weekly deals via email"
        ]
    
    async def _analyze_business_state(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze current business state"""
        return {
            "revenue_trend": "increasing",
            "inventory_turnover": 4.2,
            "customer_satisfaction": 4.5,
            "market_position": "strong"
        }
    
    async def _generate_product_recommendations(self, business_state: Dict[str, Any]) -> List[Recommendation]:
        """Generate product recommendations"""
        return [
            Recommendation(
                type="product",
                title="Expand Organic Product Line",
                description="Add more organic products to meet growing demand",
                confidence=0.85,
                expected_impact="15% revenue increase",
                implementation_effort="medium",
                priority=4
            )
        ]
    
    async def _generate_pricing_recommendations(self, business_state: Dict[str, Any]) -> List[Recommendation]:
        """Generate pricing recommendations"""
        return [
            Recommendation(
                type="pricing",
                title="Implement Dynamic Pricing",
                description="Use AI to adjust prices based on demand and competition",
                confidence=0.90,
                expected_impact="8% margin improvement",
                implementation_effort="high",
                priority=5
            )
        ]
    
    async def _generate_inventory_recommendations(self, business_state: Dict[str, Any]) -> List[Recommendation]:
        """Generate inventory recommendations"""
        return [
            Recommendation(
                type="inventory",
                title="Optimize Reorder Points",
                description="Use AI to predict optimal reorder points for each product",
                confidence=0.88,
                expected_impact="20% reduction in stockouts",
                implementation_effort="medium",
                priority=4
            )
        ]
    
    async def _generate_marketing_recommendations(self, business_state: Dict[str, Any]) -> List[Recommendation]:
        """Generate marketing recommendations"""
        return [
            Recommendation(
                type="marketing",
                title="Launch Loyalty Program",
                description="Implement a points-based loyalty program to increase retention",
                confidence=0.82,
                expected_impact="25% increase in repeat customers",
                implementation_effort="high",
                priority=3
            )
        ]
    
    def _rank_recommendations(self, recommendations: List[Recommendation], 
                            business_state: Dict[str, Any]) -> List[Recommendation]:
        """Rank recommendations by priority and impact"""
        # Sort by priority (descending) and confidence (descending)
        return sorted(recommendations, key=lambda x: (x.priority, x.confidence), reverse=True)
    
    def _generate_sentiment_insights(self, sentiment_results: List[Dict], 
                                   overall_sentiment: str) -> List[str]:
        """Generate insights from sentiment analysis"""
        insights = []
        
        if overall_sentiment == "positive":
            insights.append("Customer feedback is generally positive")
        elif overall_sentiment == "negative":
            insights.append("Customer feedback indicates areas for improvement")
        else:
            insights.append("Customer feedback is mixed")
        
        return insights
    
    async def _get_customer_profile(self, customer_id: str) -> Dict[str, Any]:
        """Get customer profile data"""
        return {}
    
    def _prepare_churn_features(self, customer_data: Dict[str, Any]) -> List[float]:
        """Prepare features for churn prediction"""
        return [0.0] * 12  # Placeholder
    
    def _calculate_churn_score(self, features: List[float]) -> float:
        """Calculate churn risk score"""
        # Simple rule-based calculation
        return 0.3  # Placeholder
    
    async def _generate_retention_strategies(self, customer_data: Dict[str, Any], 
                                           churn_score: float) -> List[str]:
        """Generate customer retention strategies"""
        strategies = []
        
        if churn_score >= 0.7:
            strategies.extend([
                "Offer personalized discount",
                "Send re-engagement email",
                "Provide exclusive early access to new products"
            ])
        elif churn_score >= 0.4:
            strategies.extend([
                "Send weekly promotional emails",
                "Offer loyalty points bonus"
            ])
        else:
            strategies.append("Continue current engagement strategy")
        
        return strategies
