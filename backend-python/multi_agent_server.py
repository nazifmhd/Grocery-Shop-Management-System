"""
Multi-Agent Server for Grocery Shop Management System
Integrates CrewAI, LangGraph, and Phidata/MemGPT for advanced AI capabilities
"""

import asyncio
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging

# Import our AI components
from agents.crew_agents import GroceryCrewAI
from agents.langgraph_workflows import GroceryLangGraphWorkflows
from agents.phidata_memory import GroceryMemoryManager
from agents.advanced_ai_features import AdvancedAIFeatures

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Grocery Shop Management System - AI Multi-Agent Server",
    description="Advanced AI-powered grocery management with CrewAI, LangGraph, and Phidata integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI components
crew_ai = None
langgraph_workflows = None
memory_manager = None
advanced_ai_features = None

# Pydantic models for API
class OrderRequest(BaseModel):
    order_id: str
    customer_id: str
    items: List[Dict[str, Any]]
    payment_method: str
    total_amount: float

class InventoryOptimizationRequest(BaseModel):
    store_id: str
    optimization_type: str = "full"  # full, specific_products, reorder_points

class CustomerServiceRequest(BaseModel):
    customer_id: str
    inquiry: str
    inquiry_type: str = "general"

class PricingOptimizationRequest(BaseModel):
    product_id: str
    current_price: float
    market_conditions: Optional[Dict[str, Any]] = None

class RecommendationRequest(BaseModel):
    context: Dict[str, Any]
    recommendation_type: str = "all"  # all, product, pricing, inventory, marketing

class DemandPredictionRequest(BaseModel):
    product_id: str
    days_ahead: int = 30
    include_factors: bool = True

class CustomerSegmentationRequest(BaseModel):
    store_id: str
    segmentation_criteria: Optional[Dict[str, Any]] = None

class SentimentAnalysisRequest(BaseModel):
    customer_id: str
    text_data: List[str]

class ChurnPredictionRequest(BaseModel):
    customer_id: str
    include_strategies: bool = True

@app.on_event("startup")
async def startup_event():
    """Initialize AI components on startup"""
    global crew_ai, langgraph_workflows, memory_manager, advanced_ai_features
    
    try:
        logger.info("Initializing AI components...")
        
        # Initialize CrewAI
        crew_ai = GroceryCrewAI()
        logger.info("✅ CrewAI initialized")
        
        # Initialize LangGraph workflows
        langgraph_workflows = GroceryLangGraphWorkflows()
        logger.info("✅ LangGraph workflows initialized")
        
        # Initialize Phidata memory manager
        memory_manager = GroceryMemoryManager()
        logger.info("✅ Phidata memory manager initialized")
        
        # Initialize advanced AI features
        advanced_ai_features = AdvancedAIFeatures()
        logger.info("✅ Advanced AI features initialized")
        
        logger.info("🚀 All AI components initialized successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error initializing AI components: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Grocery Shop Management System - AI Multi-Agent Server",
        "version": "1.0.0",
        "status": "operational",
        "ai_components": {
            "crew_ai": "active",
            "langgraph_workflows": "active",
            "phidata_memory": "active",
            "advanced_ai_features": "active"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "crew_ai": crew_ai is not None,
            "langgraph_workflows": langgraph_workflows is not None,
            "memory_manager": memory_manager is not None,
            "advanced_ai_features": advanced_ai_features is not None
        }
    }

# CrewAI Endpoints
@app.post("/crew/optimize-inventory")
async def optimize_inventory_crew(request: InventoryOptimizationRequest):
    """Run inventory optimization using CrewAI"""
    try:
        result = await crew_ai.optimize_inventory(request.store_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in inventory optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crew/optimize-sales")
async def optimize_sales_crew(request: InventoryOptimizationRequest):
    """Run sales optimization using CrewAI"""
    try:
        result = await crew_ai.optimize_sales(request.store_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in sales optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/crew/manage-operations")
async def manage_operations_crew(request: InventoryOptimizationRequest):
    """Run operations management using CrewAI"""
    try:
        result = await crew_ai.manage_operations(request.store_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in operations management: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# LangGraph Workflow Endpoints
@app.post("/workflow/order-fulfillment")
async def execute_order_fulfillment(request: OrderRequest):
    """Execute order fulfillment workflow using LangGraph"""
    try:
        order_data = {
            "order_id": request.order_id,
            "customer_id": request.customer_id,
            "items": request.items,
            "payment_method": request.payment_method,
            "total_amount": request.total_amount
        }
        
        result = await langgraph_workflows.execute_order_fulfillment(order_data)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in order fulfillment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflow/inventory-optimization")
async def execute_inventory_optimization_workflow(request: InventoryOptimizationRequest):
    """Execute inventory optimization workflow using LangGraph"""
    try:
        result = await langgraph_workflows.execute_inventory_optimization(request.store_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in inventory optimization workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflow/customer-service")
async def execute_customer_service_workflow(request: CustomerServiceRequest):
    """Execute customer service workflow using LangGraph"""
    try:
        customer_data = {
            "customer_id": request.customer_id,
            "inquiry": request.inquiry,
            "inquiry_type": request.inquiry_type
        }
        
        result = await langgraph_workflows.execute_customer_service(customer_data)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in customer service workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Phidata Memory Endpoints
@app.post("/memory/store-customer-interaction")
async def store_customer_interaction(customer_id: str, interaction_data: Dict[str, Any]):
    """Store customer interaction in memory"""
    try:
        result = await memory_manager.store_customer_interaction(customer_id, interaction_data)
        return JSONResponse(content={"success": result})
    except Exception as e:
        logger.error(f"Error storing customer interaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/customer-context/{customer_id}")
async def get_customer_context(customer_id: str):
    """Get customer context from memory"""
    try:
        result = await memory_manager.get_customer_context(customer_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error getting customer context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memory/product-recommendations")
async def get_product_recommendations(customer_id: str, context: Dict[str, Any]):
    """Get AI-powered product recommendations"""
    try:
        result = await memory_manager.get_product_recommendations(customer_id, context)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error getting product recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/sales-analysis")
async def analyze_sales_patterns(time_period: str = "30d"):
    """Analyze sales patterns using AI"""
    try:
        result = await memory_manager.analyze_sales_patterns(time_period)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error analyzing sales patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Advanced AI Features Endpoints
@app.post("/ai/predict-demand")
async def predict_demand(request: DemandPredictionRequest):
    """Predict product demand using AI"""
    try:
        result = await advanced_ai_features.predict_demand_with_ai(
            request.product_id, 
            request.days_ahead
        )
        return JSONResponse(content=result.__dict__)
    except Exception as e:
        logger.error(f"Error predicting demand: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/optimize-pricing")
async def optimize_pricing(request: PricingOptimizationRequest):
    """Optimize product pricing using AI"""
    try:
        result = await advanced_ai_features.optimize_pricing_with_ai(
            request.product_id,
            request.current_price
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error optimizing pricing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/segment-customers")
async def segment_customers(request: CustomerSegmentationRequest):
    """Segment customers using AI"""
    try:
        result = await advanced_ai_features.segment_customers_with_ai(request.store_id)
        return JSONResponse(content=[segment.__dict__ for segment in result])
    except Exception as e:
        logger.error(f"Error segmenting customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-recommendations")
async def generate_recommendations(request: RecommendationRequest):
    """Generate intelligent business recommendations"""
    try:
        result = await advanced_ai_features.generate_intelligent_recommendations(request.context)
        return JSONResponse(content=[rec.__dict__ for rec in result])
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/analyze-sentiment")
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """Analyze customer sentiment using AI"""
    try:
        result = await advanced_ai_features.analyze_customer_sentiment(
            request.customer_id,
            request.text_data
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict-churn")
async def predict_churn(request: ChurnPredictionRequest):
    """Predict customer churn risk using AI"""
    try:
        result = await advanced_ai_features.predict_churn_risk(request.customer_id)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error predicting churn: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Combined AI Operations
@app.post("/ai/complete-business-analysis")
async def complete_business_analysis(store_id: str, background_tasks: BackgroundTasks):
    """Run complete business analysis using all AI components"""
    try:
        # Run analysis in background
        background_tasks.add_task(run_complete_analysis, store_id)
        
        return JSONResponse(content={
            "message": "Complete business analysis started",
            "store_id": store_id,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error starting business analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def run_complete_analysis(store_id: str):
    """Run complete business analysis using all AI components"""
    try:
        logger.info(f"Starting complete business analysis for store {store_id}")
        
        # 1. Run CrewAI optimization
        inventory_result = await crew_ai.optimize_inventory(store_id)
        sales_result = await crew_ai.optimize_sales(store_id)
        operations_result = await crew_ai.manage_operations(store_id)
        
        # 2. Run LangGraph workflows
        inventory_workflow = await langgraph_workflows.execute_inventory_optimization(store_id)
        
        # 3. Run advanced AI features
        customer_segments = await advanced_ai_features.segment_customers_with_ai(store_id)
        recommendations = await advanced_ai_features.generate_intelligent_recommendations({
            "store_id": store_id,
            "analysis_type": "complete"
        })
        
        # 4. Analyze sales patterns
        sales_analysis = await memory_manager.analyze_sales_patterns("30d")
        
        # Store results in memory
        analysis_result = {
            "store_id": store_id,
            "crew_ai_results": {
                "inventory": inventory_result,
                "sales": sales_result,
                "operations": operations_result
            },
            "workflow_results": {
                "inventory_optimization": inventory_workflow
            },
            "ai_features_results": {
                "customer_segments": [segment.__dict__ for segment in customer_segments],
                "recommendations": [rec.__dict__ for rec in recommendations]
            },
            "sales_analysis": sales_analysis,
            "timestamp": datetime.now().isoformat()
        }
        
        await memory_manager.store_customer_interaction(
            "system",
            {
                "type": "complete_business_analysis",
                "data": analysis_result
            }
        )
        
        logger.info(f"Complete business analysis completed for store {store_id}")
        
    except Exception as e:
        logger.error(f"Error in complete business analysis: {e}")

# MCP Server Integration
@app.post("/mcp/tools")
async def get_available_tools():
    """Get available MCP tools"""
    return JSONResponse(content={
        "tools": [
            {
                "name": "optimize_inventory",
                "description": "Optimize inventory using CrewAI agents",
                "parameters": ["store_id"]
            },
            {
                "name": "predict_demand",
                "description": "Predict product demand using AI",
                "parameters": ["product_id", "days_ahead"]
            },
            {
                "name": "optimize_pricing",
                "description": "Optimize product pricing using AI",
                "parameters": ["product_id", "current_price"]
            },
            {
                "name": "segment_customers",
                "description": "Segment customers using AI",
                "parameters": ["store_id"]
            },
            {
                "name": "generate_recommendations",
                "description": "Generate intelligent business recommendations",
                "parameters": ["context"]
            },
            {
                "name": "analyze_sentiment",
                "description": "Analyze customer sentiment",
                "parameters": ["customer_id", "text_data"]
            },
            {
                "name": "predict_churn",
                "description": "Predict customer churn risk",
                "parameters": ["customer_id"]
            }
        ]
    })

@app.post("/mcp/execute")
async def execute_mcp_tool(tool_name: str, parameters: Dict[str, Any]):
    """Execute MCP tool"""
    try:
        if tool_name == "optimize_inventory":
            result = await crew_ai.optimize_inventory(parameters["store_id"])
        elif tool_name == "predict_demand":
            result = await advanced_ai_features.predict_demand_with_ai(
                parameters["product_id"], 
                parameters.get("days_ahead", 30)
            )
        elif tool_name == "optimize_pricing":
            result = await advanced_ai_features.optimize_pricing_with_ai(
                parameters["product_id"],
                parameters["current_price"]
            )
        elif tool_name == "segment_customers":
            result = await advanced_ai_features.segment_customers_with_ai(
                parameters["store_id"]
            )
        elif tool_name == "generate_recommendations":
            result = await advanced_ai_features.generate_intelligent_recommendations(
                parameters["context"]
            )
        elif tool_name == "analyze_sentiment":
            result = await advanced_ai_features.analyze_customer_sentiment(
                parameters["customer_id"],
                parameters["text_data"]
            )
        elif tool_name == "predict_churn":
            result = await advanced_ai_features.predict_churn_risk(
                parameters["customer_id"]
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown tool: {tool_name}")
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error executing MCP tool {tool_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "multi_agent_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
