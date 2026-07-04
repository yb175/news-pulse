from typing import Dict, Any, List
from utils.logger import logger
from providers.bbc_provider import BBCProvider
from providers.npr_provider import NPRProvider
from providers.guardian_provider import GuardianProvider
from providers.rss_provider import fetch_all_feeds
from normalization.normalizer import ArticleNormalizer
from extraction.article_extractor import ArticleExtractor
from deduplication.deduplicator import Deduplicator
from deduplication.strategy import URLDeduplicationStrategy
from persistence.repository import DatabaseRepository
from persistence.writer import DatabaseWriter
from clustering.keyword_cluster_strategy import KeywordClusterStrategy
from models import ArticleModel

class NewsPipeline:
    def __init__(self):
        logger.info("Initializing pipeline stages...")
        self.providers = [
            BBCProvider(),
            NPRProvider(),
            GuardianProvider()
        ]
        self.normalizer = ArticleNormalizer()
        self.extractor = ArticleExtractor()
        self.repository = DatabaseRepository()
        self.writer = DatabaseWriter()
        self.deduplicator = Deduplicator()
        self.clusterer = KeywordClusterStrategy()

    def run(self) -> Dict[str, Any]:
        logger.info("Starting ingestion sequence...")
        
        # 1. Fetch from RSS feeds
        logger.info("Stage 1: Fetching feeds from RSS providers")
        raw_items = fetch_all_feeds(self.providers)
        logger.info(f"Successfully fetched {len(raw_items)} RSS items total")
        
        # 1.5. Normalize raw RSS items to canonical articles
        logger.info("Stage 1.5: Normalizing raw RSS items")
        normalized_articles: List[ArticleModel] = []
        for raw in raw_items:
            try:
                article = self.normalizer.normalize(raw)
                normalized_articles.append(article)
            except Exception as e:
                logger.error(f"Failed to normalize raw RSS item: {e}")

        logger.info(f"Successfully normalized {len(normalized_articles)} articles")

        # 2. Extract full page contents
        logger.info("Stage 2: Extracting article content from source links")
        extracted_articles: List[ArticleModel] = []
        for article in normalized_articles:
            try:
                extracted = self.extractor.extract(article)
                extracted_articles.append(extracted)
            except Exception as e:
                logger.error(f"Failed to extract content for article '{article.title}' at {article.url}: {e}")

        logger.info(f"Successfully extracted content for {len(extracted_articles)} articles")

        # 3. Deduplicate
        logger.info("Stage 3: Deduplicating similar articles")
        existing_urls = self.repository.get_existing_urls()
        self.deduplicator.set_strategy(URLDeduplicationStrategy(existing_urls))
        deduplicated_articles = self.deduplicator.filter_duplicates(extracted_articles)

        # 4. Clustering
        logger.info("Stage 4: Organizing articles into clusters")
        existing_clusters = self.repository.get_existing_clusters()
        clustered_articles = self.clusterer.cluster_articles(deduplicated_articles, existing_clusters, self.writer)
        
        # 5. Persistence
        logger.info("Stage 5: Storing processed articles and clusters to database")
        persisted_count = 0
        for article in clustered_articles:
            try:
                self.writer.write_article(article)
                persisted_count += 1
            except Exception as e:
                logger.error(f"Failed to save article '{article.title}': {e}")
        
        return {
            "status": "success",
            "articles_fetched": len(raw_items),
            "articles_normalized": len(normalized_articles),
            "articles_extracted": len(extracted_articles),
            "articles_persisted": persisted_count,
            "clusters_updated": len({a.cluster_id for a in clustered_articles if a.cluster_id})
        }
