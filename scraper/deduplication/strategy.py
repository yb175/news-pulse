from abc import ABC, abstractmethod
from typing import Set, Iterable
from models import ArticleModel

class DeduplicationStrategy(ABC):
    @abstractmethod
    def is_duplicate(self, article: ArticleModel) -> bool:
        """Returns True if the article is a duplicate, False otherwise."""
        pass

class URLDeduplicationStrategy(DeduplicationStrategy):
    def __init__(self, existing_urls: Iterable[str] = None):
        # Handle case sensitivity by converting all URLs to lowercase and stripping whitespace
        self.existing_urls: Set[str] = {
            url.strip().lower() for url in (existing_urls or []) if url
        }

    def is_duplicate(self, article: ArticleModel) -> bool:
        if not article.url:
            return False
        
        url_lower = article.url.strip().lower()
        if url_lower in self.existing_urls:
            return True
            
        # Add to the in-memory set to prevent duplicate URLs within the same batch
        self.existing_urls.add(url_lower)
        return False
