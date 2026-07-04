import pytest
from datetime import datetime
from deduplication.deduplicator import Deduplicator
from deduplication.strategy import DeduplicationStrategy, URLDeduplicationStrategy
from models import ArticleModel

def test_duplicate_url():
    # Verifies that checking duplicate URL works
    strategy = URLDeduplicationStrategy(existing_urls=["https://example.com/art1"])
    article = ArticleModel(title="Art 1", url="https://example.com/art1", source="S", body="", body_snippet="", published_at=datetime.utcnow())
    assert strategy.is_duplicate(article) is True

def test_different_url():
    strategy = URLDeduplicationStrategy(existing_urls=["https://example.com/art1"])
    article = ArticleModel(title="Art 2", url="https://example.com/art2", source="S", body="", body_snippet="", published_at=datetime.utcnow())
    assert strategy.is_duplicate(article) is False

def test_case_sensitivity():
    # Tests that URL check is case-insensitive (handles different cases of host/scheme/etc. as duplicates)
    strategy = URLDeduplicationStrategy(existing_urls=["https://example.com/Art1"])
    article = ArticleModel(title="Art 1", url="HTTPS://EXAMPLE.COM/art1", source="S", body="", body_snippet="", published_at=datetime.utcnow())
    assert strategy.is_duplicate(article) is True

def test_existing_db_duplicate():
    # Verifies that deduplicator removes articles with URLs existing in DB
    existing_db_urls = ["https://example.com/db1", "https://example.com/db2"]
    strategy = URLDeduplicationStrategy(existing_db_urls)
    deduplicator = Deduplicator(strategy)
    
    articles = [
        ArticleModel(title="Art 1", url="https://example.com/db1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="Art 2", url="https://example.com/new1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    filtered = deduplicator.filter_duplicates(articles)
    assert len(filtered) == 1
    assert filtered[0].url == "https://example.com/new1"

def test_batch_duplicate():
    # Verifies that duplicate URLs in the same batch are resolved (first one kept, subsequent skipped)
    strategy = URLDeduplicationStrategy()
    deduplicator = Deduplicator(strategy)
    
    articles = [
        ArticleModel(title="First Copy", url="https://example.com/dup", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="Second Copy", url="https://example.com/dup", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    filtered = deduplicator.filter_duplicates(articles)
    assert len(filtered) == 1
    assert filtered[0].title == "First Copy"

def test_strategy_swappable():
    # Verify we can swap the strategy on the deduplicator
    class DummyStrategy(DeduplicationStrategy):
        def is_duplicate(self, article: ArticleModel) -> bool:
            # Mark everything as duplicate
            return True
            
    strategy = URLDeduplicationStrategy(existing_urls=[])
    deduplicator = Deduplicator(strategy)
    
    articles = [
        ArticleModel(title="Art 1", url="https://example.com/new1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    
    # URL strategy: not duplicate
    assert len(deduplicator.filter_duplicates(articles)) == 1
    
    # Swap strategy
    deduplicator.set_strategy(DummyStrategy())
    
    # Dummy strategy: everything is duplicate
    assert len(deduplicator.filter_duplicates(articles)) == 0
