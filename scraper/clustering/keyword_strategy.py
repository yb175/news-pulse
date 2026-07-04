from typing import List, Set
from .cluster_strategy import ClusterStrategy
from models.article import ArticleModel
from models.cluster import ClusterModel
from utils.logger import logger
from utils.constants import KEYWORD_SIMILARITY_THRESHOLD

class KeywordStrategy(ClusterStrategy):
    def _get_keywords(self, text: str) -> Set[str]:
        # Simple tokenization & stopword removal stub
        words = text.lower().split()
        stopwords = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "of", "about"}
        return {w for w in words if w.isalnum() and w not in stopwords}

    def _calculate_similarity(self, set1: Set[str], set2: Set[str]) -> float:
        if not set1 or not set2:
            return 0.0
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        return len(intersection) / len(union)

    def cluster_articles(self, articles: List[ArticleModel], existing_clusters: List[ClusterModel]) -> List[ArticleModel]:
        logger.info(f"Clustering {len(articles)} articles using Keyword Jaccard Similarity Strategy.")
        # Stub clustering logic:
        # Loop through articles, compare with existing clusters' titles, assign if matching, else group.
        for article in articles:
            article_keywords = self._get_keywords(article.title)
            
            best_match_id = None
            best_score = 0.0
            
            for cluster in existing_clusters:
                cluster_keywords = self._get_keywords(cluster.title)
                score = self._calculate_similarity(article_keywords, cluster_keywords)
                if score > best_score:
                    best_score = score
                    best_match_id = cluster.id
            
            if best_score >= KEYWORD_SIMILARITY_THRESHOLD:
                logger.info(f"Assigned article '{article.title}' to cluster '{best_match_id}' (score: {best_score:.2f})")
                article.cluster_id = best_match_id
            else:
                logger.info(f"No matching cluster for '{article.title}'. Needs a new cluster.")
                
        return articles
