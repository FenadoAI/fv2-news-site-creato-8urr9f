from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# AI agents
from ai_agents.agents import AgentConfig, SearchAgent, ChatAgent
import feedparser
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# AI agents init
agent_config = AgentConfig()
search_agent: Optional[SearchAgent] = None
chat_agent: Optional[ChatAgent] = None

# Main app
app = FastAPI(title="AI Agents API", description="Minimal AI Agents API with LangGraph and MCP support")

# API router
api_router = APIRouter(prefix="/api")


# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# AI agent models
class ChatRequest(BaseModel):
    message: str
    agent_type: str = "chat"  # "chat" or "search"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    agent_type: str
    capabilities: List[str]
    metadata: dict = Field(default_factory=dict)
    error: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResponse(BaseModel):
    success: bool
    query: str
    summary: str
    search_results: Optional[dict] = None
    sources_count: int
    error: Optional[str] = None


# News models
class NewsArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    url: str
    published: Optional[datetime] = None
    source: str
    image_url: Optional[str] = None
    category: Optional[str] = None


class NewsRequest(BaseModel):
    category: str = "general"  # general, world, nation, business, technology, entertainment, sports, science, health
    country: str = "US"  # US, UK, AU, etc.
    limit: int = 20


class NewsResponse(BaseModel):
    success: bool
    articles: List[NewsArticle]
    total_count: int
    category: str
    country: str
    error: Optional[str] = None


# News scraping functions
def get_google_news_rss_url(category: str = "general", country: str = "US") -> str:
    """Generate Google News RSS URL based on category and country"""
    base_url = "https://news.google.com/rss"

    # Country codes mapping
    country_codes = {
        "US": "US",
        "UK": "GB",
        "AU": "AU",
        "CA": "CA",
        "IN": "IN"
    }

    # Category mapping
    category_mapping = {
        "general": "",
        "world": "/headlines/section/topic/WORLD",
        "nation": "/headlines/section/topic/NATION",
        "business": "/headlines/section/topic/BUSINESS",
        "technology": "/headlines/section/topic/TECHNOLOGY",
        "entertainment": "/headlines/section/topic/ENTERTAINMENT",
        "sports": "/headlines/section/topic/SPORTS",
        "science": "/headlines/section/topic/SCIENCE",
        "health": "/headlines/section/topic/HEALTH"
    }

    country_code = country_codes.get(country, "US")
    category_path = category_mapping.get(category, "")

    if category_path:
        return f"{base_url}{category_path}?hl=en-{country_code}&gl={country_code}&ceid={country_code}:en"
    else:
        return f"{base_url}?hl=en-{country_code}&gl={country_code}&ceid={country_code}:en"


def extract_image_from_content(content: str) -> Optional[str]:
    """Extract image URL from RSS content"""
    try:
        soup = BeautifulSoup(content, 'html.parser')
        img_tag = soup.find('img')
        if img_tag and img_tag.get('src'):
            return img_tag.get('src')
    except:
        pass
    return None


async def scrape_google_news(category: str = "general", country: str = "US", limit: int = 20) -> List[NewsArticle]:
    """Scrape news from Google News RSS feed"""
    try:
        rss_url = get_google_news_rss_url(category, country)

        # Fetch RSS feed
        response = requests.get(rss_url, timeout=10)
        response.raise_for_status()

        # Parse RSS feed
        feed = feedparser.parse(response.content)

        articles = []
        for entry in feed.entries[:limit]:
            # Parse published date
            published_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    published_date = datetime(*entry.published_parsed[:6])
                except:
                    pass

            # Extract image from content
            image_url = None
            if hasattr(entry, 'summary'):
                image_url = extract_image_from_content(entry.summary)

            # Extract source from title (Google News format: "Title - Source")
            title = entry.title
            source = "Google News"
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                if len(parts) == 2:
                    title = parts[0]
                    source = parts[1]

            article = NewsArticle(
                title=title,
                description=entry.get('summary', '')[:500],  # Truncate description
                url=entry.link,
                published=published_date,
                source=source,
                image_url=image_url,
                category=category
            )
            articles.append(article)

        return articles

    except Exception as e:
        logger.error(f"Error scraping Google News: {e}")
        return []


# Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# AI agent routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    # Chat with AI agent
    global search_agent, chat_agent
    
    try:
        # Init agents if needed
        if request.agent_type == "search" and search_agent is None:
            search_agent = SearchAgent(agent_config)
            
        elif request.agent_type == "chat" and chat_agent is None:
            chat_agent = ChatAgent(agent_config)
        
        # Select agent
        agent = search_agent if request.agent_type == "search" else chat_agent
        
        if agent is None:
            raise HTTPException(status_code=500, detail="Failed to initialize agent")
        
        # Execute agent
        response = await agent.execute(request.message)
        
        return ChatResponse(
            success=response.success,
            response=response.content,
            agent_type=request.agent_type,
            capabilities=agent.get_capabilities(),
            metadata=response.metadata,
            error=response.error
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            success=False,
            response="",
            agent_type=request.agent_type,
            capabilities=[],
            error=str(e)
        )


@api_router.post("/search", response_model=SearchResponse)
async def search_and_summarize(request: SearchRequest):
    # Web search with AI summary
    global search_agent
    
    try:
        # Init search agent if needed
        if search_agent is None:
            search_agent = SearchAgent(agent_config)
        
        # Search with agent
        search_prompt = f"Search for information about: {request.query}. Provide a comprehensive summary with key findings."
        result = await search_agent.execute(search_prompt, use_tools=True)
        
        if result.success:
            return SearchResponse(
                success=True,
                query=request.query,
                summary=result.content,
                search_results=result.metadata,
                sources_count=result.metadata.get("tools_used", 0)
            )
        else:
            return SearchResponse(
                success=False,
                query=request.query,
                summary="",
                sources_count=0,
                error=result.error
            )
            
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return SearchResponse(
            success=False,
            query=request.query,
            summary="",
            sources_count=0,
            error=str(e)
        )


# News routes
@api_router.post("/news", response_model=NewsResponse)
async def get_news(request: NewsRequest):
    """Get news articles from Google News RSS feed"""
    try:
        articles = await scrape_google_news(
            category=request.category,
            country=request.country,
            limit=request.limit
        )

        return NewsResponse(
            success=True,
            articles=articles,
            total_count=len(articles),
            category=request.category,
            country=request.country
        )

    except Exception as e:
        logger.error(f"Error in news endpoint: {e}")
        return NewsResponse(
            success=False,
            articles=[],
            total_count=0,
            category=request.category,
            country=request.country,
            error=str(e)
        )


@api_router.get("/news/categories")
async def get_news_categories():
    """Get available news categories"""
    return {
        "success": True,
        "categories": [
            {"id": "general", "name": "General"},
            {"id": "world", "name": "World"},
            {"id": "nation", "name": "National"},
            {"id": "business", "name": "Business"},
            {"id": "technology", "name": "Technology"},
            {"id": "entertainment", "name": "Entertainment"},
            {"id": "sports", "name": "Sports"},
            {"id": "science", "name": "Science"},
            {"id": "health", "name": "Health"}
        ],
        "countries": [
            {"id": "US", "name": "United States"},
            {"id": "UK", "name": "United Kingdom"},
            {"id": "AU", "name": "Australia"},
            {"id": "CA", "name": "Canada"},
            {"id": "IN", "name": "India"}
        ]
    }


@api_router.get("/agents/capabilities")
async def get_agent_capabilities():
    # Get agent capabilities
    try:
        capabilities = {
            "search_agent": SearchAgent(agent_config).get_capabilities(),
            "chat_agent": ChatAgent(agent_config).get_capabilities()
        }
        return {
            "success": True,
            "capabilities": capabilities
        }
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging config
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Initialize agents on startup
    global search_agent, chat_agent
    logger.info("Starting AI Agents API...")
    
    # Lazy agent init for faster startup
    logger.info("AI Agents API ready!")


@app.on_event("shutdown")
async def shutdown_db_client():
    # Cleanup on shutdown
    global search_agent, chat_agent
    
    # Close MCP
    if search_agent and search_agent.mcp_client:
        # MCP cleanup automatic
        pass
    
    client.close()
    logger.info("AI Agents API shutdown complete.")
