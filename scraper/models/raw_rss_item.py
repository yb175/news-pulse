from pydantic import BaseModel
from typing import Optional

class RawRSSItem(BaseModel):
    title: str
    summary: Optional[str] = None
    url: str
    published_at: str
    source: str
    author: Optional[str] = None
