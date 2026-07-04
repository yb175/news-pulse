import pytest
from datetime import datetime
from clustering.keyword_strategy import KeywordStrategy
from models.article import ArticleModel
from models.cluster import ClusterModel

def test_keyword_strategy_assigns_correctly():
    strategy = KeywordStrategy()
    existing = [
        ClusterModel(id="cluster-id-1", title="Quantum Computing Breakthrough", summary="")
    ]
    articles = [
        ArticleModel(title="Quantum Breakthrough Reached", url="url-1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="Local Sports Event", url="url-2", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    clustered = strategy.cluster_articles(articles, existing)
    assert articles[0].cluster_id == "cluster-id-1"
    assert articles[1].cluster_id is None
