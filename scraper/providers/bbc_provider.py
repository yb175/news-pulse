import feedparser
from typing import List, Dict, Any
from .rss_provider import RSSProvider
from utils.logger import logger

class BBCProvider(RSSProvider):
    def __init__(self, feed_url: str = "http://feeds.bbci.co.uk/news/rss.xml"):
        super().__init__("BBC News", feed_url)

    def fetch_feed(self) -> List[Dict[str, Any]]:
        logger.info(f"Fetching feed from {self.name}...")
        parsed_feed = feedparser.parse(self.feed_url)
        articles = []
        for entry in parsed_feed.entries:
            articles.append({
                "title": entry.get("title", ""),
                "url": entry.get("link", ""),
                "published_at": entry.get("published", ""),
                "author": entry.get("author", "BBC Staff"),
                "summary": entry.get("summary", "")
            })
        return articles
