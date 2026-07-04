from typing import List, Set
from .cluster_strategy import ClusterStrategy
from models.article import ArticleModel
from models.cluster import ClusterModel
from utils.logger import logger
from utils.constants import KEYWORD_SIMILARITY_THRESHOLD

class KeywordClusterStrategy(ClusterStrategy):
    def _get_keywords(self, text: str) -> Set[str]:
        if not text:
            return set()
        words = text.lower().split()
        stopwords = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "is", "are", "was", "were", "of", "about"}
        return {w for w in words if w.isalnum() and w not in stopwords}

    def _calculate_similarity(self, set1: Set[str], set2: Set[str]) -> float:
        if not set1 or not set2:
            return 0.0
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        return len(intersection) / len(union)

    def cluster_articles(self, articles: List[ArticleModel], existing_clusters: List[ClusterModel], writer=None) -> List[ArticleModel]:
        logger.info(f"Clustering {len(articles)} articles using Keyword Jaccard Similarity Strategy.")
        
        all_clusters = list(existing_clusters)
        
        for article in articles:
            article_keywords = self._get_keywords(article.title)
            
            best_match = None
            best_score = 0.0
            
            for cluster in all_clusters:
                cluster_keywords = self._get_keywords(cluster.title)
                score = self._calculate_similarity(article_keywords, cluster_keywords)
                if score > best_score:
                    best_score = score
                    best_match = cluster
            
            if best_score >= KEYWORD_SIMILARITY_THRESHOLD and best_match is not None:
                logger.info(f"Assigned article '{article.title}' to cluster '{best_match.title}' (ID: {best_match.id}, score: {best_score:.2f})")
                article.cluster_id = best_match.id
            else:
                logger.info(f"No matching cluster for '{article.title}'. Creating new cluster.")
                topic_label = article.title.strip()
                
                if writer:
                    cluster_id = writer.get_or_create_cluster(topic_label, summary=f"Cluster for {topic_label}")
                else:
                    import uuid
                    cluster_id = str(uuid.uuid4())
                
                article.cluster_id = cluster_id
                
                new_cluster = ClusterModel(id=cluster_id, title=topic_label, summary=f"Cluster for {topic_label}")
                all_clusters.append(new_cluster)
                
        return articles
