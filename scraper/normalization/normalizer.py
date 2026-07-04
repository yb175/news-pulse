from typing import Dict, Any
from datetime import datetime
from models.article import ArticleModel
from utils.logger import logger

class ArticleNormalizer:
    def normalize(self, raw_item: Dict[str, Any]) -> ArticleModel:
        logger.info(f"Normalizing article: {raw_item.get('title', '')}")
        
        # Parse published_at timestamp
        pub_date = raw_item.get("published_at")
        if isinstance(pub_date, str):
            try:
                # Basic string parser fallback
                published_at = datetime.fromisoformat(pub_date.replace("GMT", "+00:00"))
            except ValueError:
                published_at = datetime.utcnow()
        else:
            published_at = pub_date or datetime.utcnow()

        return ArticleModel(
            title=raw_item.get("title", "Untitled"),
            url=raw_item.get("url", ""),
            source=raw_item.get("source", "Unknown"),
            author=raw_item.get("author"),
            body="",
            body_snippet=raw_item.get("summary", ""),
            published_at=published_at
        )
