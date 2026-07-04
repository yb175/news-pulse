from abc import ABC
import requests
import feedparser
from typing import List
from models import RawRSSItem
from utils.logger import logger

class RSSProvider(ABC):
    def __init__(self, name: str, feed_url: str):
        self.name = name
        self.feed_url = feed_url

    def fetch(self) -> List[RawRSSItem]:
        """Fetches and parses feed entries into RawRSSItem models."""
        logger.info(f"Fetching feed from {self.name} at {self.feed_url}...")
        try:
            response = requests.get(self.feed_url, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"HTTP request failed for {self.name}: {e}")
            raise e

        parsed_feed = feedparser.parse(response.content)
        
        # If the parser indicates the XML is not well-formed (bozo = 1) 
        # and has returned no entries, treat it as a malformed feed error.
        if parsed_feed.bozo and not parsed_feed.entries:
            err_msg = f"Malformed RSS feed from {self.name}: {parsed_feed.bozo_exception}"
            logger.error(err_msg)
            raise ValueError(err_msg)

        articles = []
        for entry in parsed_feed.entries:
            articles.append(
                RawRSSItem(
                    title=entry.get("title", ""),
                    summary=entry.get("summary", ""),
                    url=entry.get("link", ""),
                    published_at=entry.get("published", ""),
                    source=self.name
                )
            )
        return articles

def fetch_all_feeds(providers: List[RSSProvider]) -> List[RawRSSItem]:
    """
    Fetches and aggregates articles from a list of RSS providers.
    Handles failures individually, ensuring a single provider's failure
    does not stop the ingestion pipeline.
    """
    combined_articles = []
    for provider in providers:
        try:
            articles = provider.fetch()
            combined_articles.extend(articles)
            logger.info(f"Successfully fetched {len(articles)} articles from {provider.name}")
        except Exception as e:
            logger.error(f"Error fetching feed from provider {provider.name}: {e}", exc_info=True)
    return combined_articles
