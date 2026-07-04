from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ArticleModel(BaseModel):
    id: Optional[str] = None
    title: str
    url: str
    source: str
    author: Optional[str] = None
    body: str
    body_snippet: str
    summary: Optional[str] = None
    published_at: datetime
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    cluster_id: Optional[str] = None
