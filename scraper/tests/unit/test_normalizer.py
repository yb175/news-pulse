import pytest
from datetime import datetime
from normalization.normalizer import ArticleNormalizer

def test_normalizer_standardizes_raw_item():
    normalizer = ArticleNormalizer()
    raw_item = {
        "title": "Quantum Leap in Processing Power",
        "url": "https://example.com/quantum",
        "source": "TechNews",
        "published_at": "2026-07-04T05:00:00+00:00",
        "author": "Alice Vance",
        "summary": "Scientists have achieved an important quantum processor milestone."
    }
    normalized = normalizer.normalize(raw_item)
    assert normalized.title == "Quantum Leap in Processing Power"
    assert normalized.source == "TechNews"
    assert isinstance(normalized.published_at, datetime)
