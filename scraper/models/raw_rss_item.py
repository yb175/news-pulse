from pydantic import BaseModel

class RawRSSItem(BaseModel):
    title: str
    summary: str
    url: str
    published_at: str
    source: str
