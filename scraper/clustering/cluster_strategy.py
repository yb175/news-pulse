from abc import ABC, abstractmethod
from typing import List
from models.article import ArticleModel
from models.cluster import ClusterModel

class ClusterStrategy(ABC):
    @abstractmethod
    def cluster_articles(self, articles: List[ArticleModel], existing_clusters: List[ClusterModel], writer=None) -> List[ArticleModel]:
        """Clusters articles and assigns cluster_id field, possibly creating new clusters."""
        pass
