from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ClusterModel(BaseModel):
    id: Optional[str] = None
    title: str
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
