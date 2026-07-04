from typing import List
from .cluster_strategy import ClusterStrategy
from models.article import ArticleModel
from models.cluster import ClusterModel
from utils.logger import logger

class EmbeddingStrategy(ClusterStrategy):
    def cluster_articles(self, articles: List[ArticleModel], existing_clusters: List[ClusterModel]) -> List[ArticleModel]:
        logger.info("Semantic vector embedding strategy is a placeholder for future implementation.")
        # Currently defaults back to no assignment or basic clustering placeholder
        return articles
