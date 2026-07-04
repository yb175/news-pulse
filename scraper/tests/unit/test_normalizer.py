import pytest
from datetime import datetime
from normalization.normalizer import ArticleNormalizer
from models import RawRSSItem

def test_valid_normalization():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Valid Title",
        "url": "https://example.com/valid",
        "source": "Valid Source",
        "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
        "summary": "Valid Summary"
    }
    normalized = normalizer.normalize(raw)
    assert normalized.title == "Valid Title"
    assert normalized.url == "https://example.com/valid"
    assert normalized.source == "Valid Source"
    assert normalized.summary == "Valid Summary"
    assert normalized.body_snippet == "Valid Summary"
    assert normalized.published_at == datetime(2026, 7, 4, 8, 0, 0)

def test_missing_title():
    normalizer = ArticleNormalizer()
    raw = {
        "url": "https://example.com/valid",
        "source": "Valid Source",
        "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
        "summary": "Valid Summary"
    }
    with pytest.raises(ValueError) as exc:
        normalizer.normalize(raw)
    assert "title" in str(exc.value)

def test_missing_url():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Valid Title",
        "source": "Valid Source",
        "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
    }
    with pytest.raises(ValueError) as exc:
        normalizer.normalize(raw)
    assert "url" in str(exc.value)

def test_malformed_datetime():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Valid Title",
        "url": "https://example.com/valid",
        "source": "Valid Source",
        "published_at": "invalid-datetime",
    }
    with pytest.raises(ValueError) as exc:
        normalizer.normalize(raw)
    assert "datetime" in str(exc.value) or "published_at" in str(exc.value)

def test_whitespace_trimming_and_duplicate_removal():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "  Valid \t Title  with   spaces   ",
        "url": "   https://example.com/valid   ",
        "source": "  Valid \n Source  ",
        "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
        "summary": "  This is a   summary   "
    }
    normalized = normalizer.normalize(raw)
    assert normalized.title == "Valid Title with spaces"
    assert normalized.url == "https://example.com/valid"
    assert normalized.source == "Valid Source"
    assert normalized.summary == "This is a summary"

def test_utc_conversion():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Valid Title",
        "url": "https://example.com/valid",
        "source": "Valid Source",
        "published_at": "2026-07-04T13:30:00+05:30",
    }
    normalized = normalizer.normalize(raw)
    # 13:30 - 5:30 = 08:00 UTC
    assert normalized.published_at == datetime(2026, 7, 4, 8, 0, 0)

def test_invalid_url_rejection():
    normalizer = ArticleNormalizer()
    invalid_urls = [
        "not-a-url",
        "ftp://example.com/valid",
        "http:///no-host",
        "https://",
    ]
    for url in invalid_urls:
        raw = {
            "title": "Valid Title",
            "url": url,
            "source": "Valid Source",
            "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
        }
        with pytest.raises(ValueError) as exc:
            normalizer.normalize(raw)
        assert "Invalid URL" in str(exc.value)

def test_optional_summary_missing():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Valid Title",
        "url": "https://example.com/valid",
        "source": "Valid Source",
        "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
    }
    normalized = normalizer.normalize(raw)
    assert normalized.summary is None
    assert normalized.body_snippet == ""

def test_provider_specific_field_mapping():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Mapped Title",
        "link": "https://example.com/mapped",
        "provider": "BBC News",
        "pubDate": "Sat, 04 Jul 2026 08:00:00 GMT",
        "description": "Mapped Summary"
    }
    normalized = normalizer.normalize(raw)
    assert normalized.title == "Mapped Title"
    assert normalized.url == "https://example.com/mapped"
    assert normalized.source == "BBC News"
    assert normalized.summary == "Mapped Summary"
    assert normalized.published_at == datetime(2026, 7, 4, 8, 0, 0)

def test_raw_rss_item_object_normalization():
    normalizer = ArticleNormalizer()
    raw_item = RawRSSItem(
        title="Raw Title",
        summary="Raw Summary",
        url="https://example.com/raw",
        published_at="Sat, 04 Jul 2026 08:00:00 GMT",
        source="Raw Source"
    )
    normalized = normalizer.normalize(raw_item)
    assert normalized.title == "Raw Title"
    assert normalized.url == "https://example.com/raw"
    assert normalized.source == "Raw Source"
    assert normalized.summary == "Raw Summary"

def test_missing_source():
    normalizer = ArticleNormalizer()
    raw = {
        "title": "Valid Title",
        "url": "https://example.com/valid",
        "published_at": "Sat, 04 Jul 2026 08:00:00 GMT",
    }
    with pytest.raises(ValueError) as exc:
        normalizer.normalize(raw)
    assert "source" in str(exc.value)
