from typing import List
from models.article import ArticleModel
from utils.logger import logger

class Deduplicator:
    def filter_duplicates(self, articles: List[ArticleModel], existing_urls: List[str]) -> List[ArticleModel]:
        logger.info(f"Filtering duplicates from {len(articles)} articles. Existing count: {len(existing_urls)}")
        unique_articles = []
        
        for article in articles:
            if article.url not in existing_urls:
                unique_articles.append(article)
            else:
                logger.info(f"Duplicate found and skipped: {article.url}")
                
        logger.info(f"Remaining unique articles: {len(unique_articles)}")
        return unique_articles
