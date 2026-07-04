import pytest
from datetime import datetime
from deduplication.deduplicator import Deduplicator
from models.article import ArticleModel

def test_deduplicator_filters_known_urls():
    deduplicator = Deduplicator()
    articles = [
        ArticleModel(title="A", url="url-1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="B", url="url-2", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    existing = ["url-1"]
    filtered = deduplicator.filter_duplicates(articles, existing)
    assert len(filtered) == 1
    assert filtered[0].url == "url-2"
