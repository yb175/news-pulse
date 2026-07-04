from abc import ABC, abstractmethod
from typing import List, Dict, Any

class RSSProvider(ABC):
    def __init__(self, name: str, feed_url: str):
        self.name = name
        self.feed_url = feed_url

    @abstractmethod
    def fetch_feed(self) -> List[Dict[str, Any]]:
        """Fetches and parses feed entries into raw item dictionaries."""
        pass
