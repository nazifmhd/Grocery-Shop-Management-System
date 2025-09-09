"""
Phidata and MemGPT Integration for Grocery Shop Management System
Advanced memory and knowledge management using Phidata and MemGPT
"""

from typing import Dict, List, Any, Optional, Union
import os
from datetime import datetime, timedelta
import json
import asyncio
from dataclasses import dataclass

# Phidata imports
from phidata import Assistant, AssistantRun, Workspace
from phidata.llm.openai import OpenAIChat
from phidata.llm.google import GoogleGemini
from phidata.tools import ToolRegistry
from phidata.memory import PostgresMemory, RedisMemory
from phidata.knowledge import KnowledgeBase
from phidata.vectordb import PgVector, ChromaDB, Pinecone
from phidata.embedder import OpenAIEmbedder, SentenceTransformerEmbedder

# MemGPT imports
from memgpt import MemGPT
from memgpt.config import MemGPTConfig
from memgpt.agent import Agent
from memgpt.interface import CLIInterface
from memgpt.persistence_manager import InMemoryStateManager, PostgresPersistenceManager

@dataclass
class CustomerProfile:
    """Customer profile for memory management"""
    customer_id: str
    name: str
    preferences: Dict[str, Any]
    purchase_history: List[Dict[str, Any]]
    loyalty_points: int
    last_interaction: datetime
    communication_preferences: Dict[str, Any]

@dataclass
class ProductKnowledge:
    """Product knowledge for memory management"""
    product_id: str
    name: str
    category: str
    attributes: Dict[str, Any]
    sales_performance: Dict[str, Any]
    customer_feedback: List[Dict[str, Any]]
    supplier_info: Dict[str, Any]

class GroceryMemoryManager:
    """Advanced memory management using Phidata and MemGPT"""
    
    def __init__(self):
        self.phidata_workspace = self._setup_phidata_workspace()
        self.memgpt_config = self._setup_memgpt_config()
        self.knowledge_bases = self._create_knowledge_bases()
        self.memory_stores = self._create_memory_stores()
        self.assistants = self._create_phidata_assistants()
        self.memgpt_agents = self._create_memgpt_agents()
    
    def _setup_phidata_workspace(self) -> Workspace:
        """Setup Phidata workspace"""
        return Workspace(
            name="grocery_management_workspace",
            llm=OpenAIChat(
                model="gpt-4-turbo-preview",
                api_key=os.getenv("OPENAI_API_KEY")
            ),
            memory=PostgresMemory(
                db_url=os.getenv("DATABASE_URL"),
                table_name="phidata_memory"
            ),
            knowledge_base=KnowledgeBase(
                vector_db=PgVector(
                    db_url=os.getenv("DATABASE_URL"),
                    collection_name="grocery_knowledge"
                ),
                embedder=OpenAIEmbedder(
                    model="text-embedding-3-large",
                    api_key=os.getenv("OPENAI_API_KEY")
                )
            )
        )
    
    def _setup_memgpt_config(self) -> MemGPTConfig:
        """Setup MemGPT configuration"""
        config = MemGPTConfig()
        config.openai_api_key = os.getenv("OPENAI_API_KEY")
        config.persist_dir = "./memgpt_data"
        config.archival_storage_uri = os.getenv("DATABASE_URL")
        return config
    
    def _create_knowledge_bases(self) -> Dict[str, KnowledgeBase]:
        """Create specialized knowledge bases"""
        
        # Customer Knowledge Base
        customer_kb = KnowledgeBase(
            name="customer_knowledge",
            vector_db=ChromaDB(
                collection_name="customer_knowledge",
                persist_directory="./chroma_db/customers"
            ),
            embedder=SentenceTransformerEmbedder(
                model_name="all-MiniLM-L6-v2"
            )
        )
        
        # Product Knowledge Base
        product_kb = KnowledgeBase(
            name="product_knowledge",
            vector_db=Pinecone(
                api_key=os.getenv("PINECONE_API_KEY"),
                environment=os.getenv("PINECONE_ENVIRONMENT"),
                index_name="grocery-products"
            ),
            embedder=OpenAIEmbedder(
                model="text-embedding-3-large",
                api_key=os.getenv("OPENAI_API_KEY")
            )
        )
        
        # Sales Knowledge Base
        sales_kb = KnowledgeBase(
            name="sales_knowledge",
            vector_db=PgVector(
                db_url=os.getenv("DATABASE_URL"),
                collection_name="sales_knowledge"
            ),
            embedder=OpenAIEmbedder(
                model="text-embedding-3-large",
                api_key=os.getenv("OPENAI_API_KEY")
            )
        )
        
        return {
            "customers": customer_kb,
            "products": product_kb,
            "sales": sales_kb
        }
    
    def _create_memory_stores(self) -> Dict[str, Any]:
        """Create memory stores for different data types"""
        
        # Customer Memory Store
        customer_memory = RedisMemory(
            redis_url=os.getenv("REDIS_URL"),
            key_prefix="customer:",
            ttl=timedelta(days=30)
        )
        
        # Product Memory Store
        product_memory = PostgresMemory(
            db_url=os.getenv("DATABASE_URL"),
            table_name="product_memory"
        )
        
        # Transaction Memory Store
        transaction_memory = RedisMemory(
            redis_url=os.getenv("REDIS_URL"),
            key_prefix="transaction:",
            ttl=timedelta(hours=24)
        )
        
        return {
            "customers": customer_memory,
            "products": product_memory,
            "transactions": transaction_memory
        }
    
    def _create_phidata_assistants(self) -> Dict[str, Assistant]:
        """Create Phidata assistants for different roles"""
        
        # Customer Service Assistant
        customer_assistant = Assistant(
            name="Customer Service Assistant",
            role="Provide personalized customer service and support",
            instructions="""
            You are a knowledgeable customer service assistant for a grocery store.
            You have access to customer purchase history, preferences, and product information.
            Provide helpful, personalized assistance to customers.
            """,
            llm=OpenAIChat(
                model="gpt-4-turbo-preview",
                api_key=os.getenv("OPENAI_API_KEY")
            ),
            memory=self.memory_stores["customers"],
            knowledge_base=self.knowledge_bases["customers"],
            tools=ToolRegistry()
        )
        
        # Product Recommendation Assistant
        product_assistant = Assistant(
            name="Product Recommendation Assistant",
            role="Provide intelligent product recommendations based on customer preferences and behavior",
            instructions="""
            You are an expert product recommendation assistant.
            Analyze customer preferences, purchase history, and current trends to provide personalized recommendations.
            Consider factors like dietary restrictions, budget, and seasonal preferences.
            """,
            llm=GoogleGemini(
                model="gemini-pro",
                api_key=os.getenv("GEMINI_API_KEY")
            ),
            memory=self.memory_stores["products"],
            knowledge_base=self.knowledge_bases["products"],
            tools=ToolRegistry()
        )
        
        # Sales Analytics Assistant
        sales_assistant = Assistant(
            name="Sales Analytics Assistant",
            role="Analyze sales data and provide business insights",
            instructions="""
            You are a sales analytics expert.
            Analyze sales patterns, identify trends, and provide actionable insights for business growth.
            Focus on revenue optimization and customer satisfaction.
            """,
            llm=OpenAIChat(
                model="gpt-4-turbo-preview",
                api_key=os.getenv("OPENAI_API_KEY")
            ),
            memory=self.memory_stores["transactions"],
            knowledge_base=self.knowledge_bases["sales"],
            tools=ToolRegistry()
        )
        
        return {
            "customer_service": customer_assistant,
            "product_recommendation": product_assistant,
            "sales_analytics": sales_assistant
        }
    
    def _create_memgpt_agents(self) -> Dict[str, Agent]:
        """Create MemGPT agents for persistent memory"""
        
        # Customer Relationship Agent
        customer_agent = Agent(
            name="Customer Relationship Manager",
            persona="You are a customer relationship manager for a grocery store. You remember every interaction with customers and build long-term relationships.",
            human="You are a customer service representative working with the AI agent.",
            interface=CLIInterface(),
            persistence_manager=PostgresPersistenceManager(
                db_url=os.getenv("DATABASE_URL")
            )
        )
        
        # Inventory Management Agent
        inventory_agent = Agent(
            name="Inventory Management Specialist",
            persona="You are an inventory management specialist. You track stock levels, predict demand, and optimize inventory decisions.",
            human="You are a store manager working with the AI agent.",
            interface=CLIInterface(),
            persistence_manager=PostgresPersistenceManager(
                db_url=os.getenv("DATABASE_URL")
            )
        )
        
        # Business Intelligence Agent
        bi_agent = Agent(
            name="Business Intelligence Analyst",
            persona="You are a business intelligence analyst. You analyze data patterns, identify opportunities, and provide strategic recommendations.",
            human="You are a business owner working with the AI agent.",
            interface=CLIInterface(),
            persistence_manager=PostgresPersistenceManager(
                db_url=os.getenv("DATABASE_URL")
            )
        )
        
        return {
            "customer_relationship": customer_agent,
            "inventory_management": inventory_agent,
            "business_intelligence": bi_agent
        }
    
    async def store_customer_interaction(self, customer_id: str, interaction_data: Dict[str, Any]) -> bool:
        """Store customer interaction in memory"""
        try:
            # Store in Phidata memory
            await self.memory_stores["customers"].store(
                key=f"interaction:{customer_id}:{datetime.now().isoformat()}",
                value=interaction_data
            )
            
            # Store in MemGPT agent memory
            customer_agent = self.memgpt_agents["customer_relationship"]
            await customer_agent.step(
                f"Customer {customer_id} interaction: {interaction_data.get('message', '')}"
            )
            
            # Update knowledge base
            await self.knowledge_bases["customers"].add_documents(
                documents=[f"Customer {customer_id}: {interaction_data.get('message', '')}"],
                metadata={"customer_id": customer_id, "timestamp": datetime.now().isoformat()}
            )
            
            return True
        except Exception as e:
            print(f"Error storing customer interaction: {e}")
            return False
    
    async def get_customer_context(self, customer_id: str) -> Dict[str, Any]:
        """Get comprehensive customer context from memory"""
        try:
            # Get from Phidata memory
            phidata_memory = await self.memory_stores["customers"].get(
                key=f"profile:{customer_id}"
            )
            
            # Get from MemGPT agent
            customer_agent = self.memgpt_agents["customer_relationship"]
            memgpt_context = await customer_agent.get_memory()
            
            # Get from knowledge base
            knowledge_results = await self.knowledge_bases["customers"].search(
                query=f"customer {customer_id}",
                limit=10
            )
            
            return {
                "phidata_memory": phidata_memory,
                "memgpt_context": memgpt_context,
                "knowledge_base": knowledge_results,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error getting customer context: {e}")
            return {}
    
    async def store_product_knowledge(self, product_id: str, knowledge_data: Dict[str, Any]) -> bool:
        """Store product knowledge in memory"""
        try:
            # Store in Phidata memory
            await self.memory_stores["products"].store(
                key=f"product:{product_id}",
                value=knowledge_data
            )
            
            # Store in MemGPT agent memory
            inventory_agent = self.memgpt_agents["inventory_management"]
            await inventory_agent.step(
                f"Product {product_id} update: {knowledge_data.get('description', '')}"
            )
            
            # Update knowledge base
            await self.knowledge_bases["products"].add_documents(
                documents=[f"Product {product_id}: {knowledge_data.get('description', '')}"],
                metadata={"product_id": product_id, "timestamp": datetime.now().isoformat()}
            )
            
            return True
        except Exception as e:
            print(f"Error storing product knowledge: {e}")
            return False
    
    async def get_product_recommendations(self, customer_id: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get AI-powered product recommendations"""
        try:
            # Get customer context
            customer_context = await self.get_customer_context(customer_id)
            
            # Use Phidata assistant for recommendations
            product_assistant = self.assistants["product_recommendation"]
            recommendation_prompt = f"""
            Based on the customer context and current situation, provide personalized product recommendations.
            
            Customer Context: {customer_context}
            Current Context: {context}
            
            Provide 5-10 specific product recommendations with reasoning.
            """
            
            response = await product_assistant.run(
                message=recommendation_prompt
            )
            
            return self._parse_recommendations(response.content)
        except Exception as e:
            print(f"Error getting product recommendations: {e}")
            return []
    
    async def analyze_sales_patterns(self, time_period: str = "30d") -> Dict[str, Any]:
        """Analyze sales patterns using AI"""
        try:
            # Use sales analytics assistant
            sales_assistant = self.assistants["sales_analytics"]
            
            analysis_prompt = f"""
            Analyze sales patterns for the last {time_period}.
            Provide insights on:
            1. Top performing products
            2. Customer behavior trends
            3. Revenue patterns
            4. Opportunities for improvement
            """
            
            response = await sales_assistant.run(
                message=analysis_prompt
            )
            
            # Store analysis in MemGPT agent
            bi_agent = self.memgpt_agents["business_intelligence"]
            await bi_agent.step(f"Sales analysis for {time_period}: {response.content}")
            
            return {
                "analysis": response.content,
                "timestamp": datetime.now().isoformat(),
                "period": time_period
            }
        except Exception as e:
            print(f"Error analyzing sales patterns: {e}")
            return {}
    
    async def predict_demand(self, product_id: str, days_ahead: int = 30) -> Dict[str, Any]:
        """Predict product demand using AI and historical data"""
        try:
            # Get historical data from memory
            product_memory = await self.memory_stores["products"].get(
                key=f"sales_history:{product_id}"
            )
            
            # Use inventory management agent
            inventory_agent = self.memgpt_agents["inventory_management"]
            
            prediction_prompt = f"""
            Predict demand for product {product_id} for the next {days_ahead} days.
            Consider historical sales data, seasonal patterns, and current trends.
            
            Historical Data: {product_memory}
            """
            
            response = await inventory_agent.step(prediction_prompt)
            
            return {
                "product_id": product_id,
                "predicted_demand": response,
                "days_ahead": days_ahead,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error predicting demand: {e}")
            return {}
    
    async def get_customer_service_response(self, customer_id: str, inquiry: str) -> str:
        """Get AI-powered customer service response"""
        try:
            # Get customer context
            customer_context = await self.get_customer_context(customer_id)
            
            # Use customer service assistant
            customer_assistant = self.assistants["customer_service"]
            
            response = await customer_assistant.run(
                message=f"""
                Customer Inquiry: {inquiry}
                Customer Context: {customer_context}
                
                Provide a helpful, personalized response.
                """
            )
            
            # Store interaction
            await self.store_customer_interaction(
                customer_id,
                {
                    "inquiry": inquiry,
                    "response": response.content,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return response.content
        except Exception as e:
            print(f"Error getting customer service response: {e}")
            return "I apologize, but I'm having trouble processing your request. Please try again or contact our support team."
    
    def _parse_recommendations(self, content: str) -> List[Dict[str, Any]]:
        """Parse recommendation content into structured format"""
        # Implementation to parse AI response into structured recommendations
        recommendations = []
        # Add parsing logic here
        return recommendations
    
    async def cleanup_old_memories(self, days_old: int = 90) -> bool:
        """Clean up old memories to manage storage"""
        try:
            # Clean up Redis memories
            cutoff_date = datetime.now() - timedelta(days=days_old)
            
            # Implementation for memory cleanup
            return True
        except Exception as e:
            print(f"Error cleaning up memories: {e}")
            return False
    
    async def export_memory_data(self, memory_type: str) -> Dict[str, Any]:
        """Export memory data for backup or analysis"""
        try:
            if memory_type == "customers":
                return await self.memory_stores["customers"].export()
            elif memory_type == "products":
                return await self.memory_stores["products"].export()
            elif memory_type == "transactions":
                return await self.memory_stores["transactions"].export()
            else:
                return {}
        except Exception as e:
            print(f"Error exporting memory data: {e}")
            return {}
