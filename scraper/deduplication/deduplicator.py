from typing import List
from models.article import ArticleModel
from utils.logger import logger
from .strategy import DeduplicationStrategy

class Deduplicator:
    def __init__(self, strategy: DeduplicationStrategy = None):
        self.strategy = strategy

    def set_strategy(self, strategy: DeduplicationStrategy):
        self.strategy = strategy

    def filter_duplicates(self, articles: List[ArticleModel]) -> List[ArticleModel]:
        logger.info(f"Filtering duplicates from {len(articles)} articles using {self.strategy.__class__.__name__}")
        unique_articles = []
        for article in articles:
            if self.strategy.is_duplicate(article):
                logger.info(f"Duplicate found and skipped: {article.url}")
            else:
                unique_articles.append(article)
        logger.info(f"Remaining unique articles: {len(unique_articles)}")
        return unique_articles
