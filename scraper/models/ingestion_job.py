from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class IngestionJobModel(BaseModel):
    id: Optional[str] = None
    status: str = "PENDING"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    articles_found: int = 0
    logs: Optional[str] = None
