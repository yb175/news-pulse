import pytest
from providers.bbc_provider import BBCProvider

def test_bbc_provider_init():
    provider = BBCProvider()
    assert provider.name == "BBC News"
    assert "rss" in provider.feed_url
