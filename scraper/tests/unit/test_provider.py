import pytest
from unittest.mock import patch, MagicMock
import requests
from providers.bbc_provider import BBCProvider
from providers.npr_provider import NPRProvider
from providers.guardian_provider import GuardianProvider
from providers.rss_provider import fetch_all_feeds
from models import RawRSSItem

# Standard mock RSS XML feed content
SAMPLE_BBC_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BBC News</title>
    <link>http://www.bbc.co.uk/news/</link>
    <description>BBC News - Home</description>
    <item>
      <title>Mock BBC Article 1</title>
      <description>Summary of Mock BBC Article 1</description>
      <link>https://www.bbc.co.uk/news/articles/1</link>
      <pubDate>Sat, 04 Jul 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Mock BBC Article 2</title>
      <description>Summary of Mock BBC Article 2</description>
      <link>https://www.bbc.co.uk/news/articles/2</link>
      <pubDate>Sat, 04 Jul 2026 08:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>
"""

SAMPLE_NPR_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>NPR</title>
    <link>https://www.npr.org/</link>
    <description>NPR News</description>
    <item>
      <title>Mock NPR Article</title>
      <description>Summary of Mock NPR Article</description>
      <link>https://www.npr.org/articles/1</link>
      <pubDate>Sat, 04 Jul 2026 07:45:00 GMT</pubDate>
    </item>
  </channel>
</rss>
"""

SAMPLE_GUARDIAN_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Guardian</title>
    <link>https://www.theguardian.com</link>
    <description>Guardian News</description>
    <item>
      <title>Mock Guardian Article</title>
      <description>Summary of Mock Guardian Article</description>
      <link>https://www.theguardian.com/articles/1</link>
      <pubDate>Sat, 04 Jul 2026 07:50:00 GMT</pubDate>
    </item>
  </channel>
</rss>
"""

def test_bbc_provider_init():
    provider = BBCProvider()
    assert provider.name == "BBC News"
    assert "rss" in provider.feed_url

def test_npr_provider_init():
    provider = NPRProvider()
    assert provider.name == "NPR"
    assert "rss" in provider.feed_url

def test_guardian_provider_init():
    provider = GuardianProvider()
    assert provider.name == "The Guardian"
    assert "rss" in provider.feed_url

@patch("requests.get")
def test_provider_returns_parsed_articles(mock_get):
    # Mock BBC Provider success
    mock_response = MagicMock()
    mock_response.content = SAMPLE_BBC_XML
    mock_response.status_code = 200
    mock_get.return_value = mock_response

    provider = BBCProvider()
    articles = provider.fetch()

    assert len(articles) == 2
    assert all(isinstance(a, RawRSSItem) for a in articles)
    
    assert articles[0].title == "Mock BBC Article 1"
    assert articles[0].summary == "Summary of Mock BBC Article 1"
    assert articles[0].url == "https://www.bbc.co.uk/news/articles/1"
    assert articles[0].published_at == "Sat, 04 Jul 2026 08:00:00 GMT"
    assert articles[0].source == "BBC News"

    assert articles[1].title == "Mock BBC Article 2"
    assert articles[1].url == "https://www.bbc.co.uk/news/articles/2"
    assert articles[1].source == "BBC News"

@patch("requests.get")
def test_malformed_rss_handled(mock_get):
    # Mocking completely invalid XML
    mock_response = MagicMock()
    mock_response.content = b"Not XML at all"
    mock_response.status_code = 200
    mock_get.return_value = mock_response

    provider = BBCProvider()
    with pytest.raises(ValueError) as excinfo:
        provider.fetch()
    assert "Malformed RSS feed" in str(excinfo.value)

@patch("requests.get")
def test_unavailable_rss_handled(mock_get):
    # Mocking HTTP Connection Error
    mock_get.side_effect = requests.exceptions.ConnectionError("Connection Refused")

    provider = BBCProvider()
    with pytest.raises(requests.exceptions.RequestException):
        provider.fetch()

@patch("requests.get")
def test_timeout_handled(mock_get):
    # Mocking Timeout
    mock_get.side_effect = requests.exceptions.Timeout("Request timed out")

    provider = BBCProvider()
    with pytest.raises(requests.exceptions.RequestException):
        provider.fetch()

@patch("requests.get")
def test_provider_isolation_and_failure_handling(mock_get):
    bbc_provider = BBCProvider()
    npr_provider = NPRProvider()
    guardian_provider = GuardianProvider()

    # Define side effect for requests.get
    # BBC succeeds, NPR times out, Guardian succeeds
    def requests_side_effect(url, **kwargs):
        resp = MagicMock()
        resp.status_code = 200
        if "bbc" in url:
            resp.content = SAMPLE_BBC_XML
            return resp
        elif "npr" in url:
            raise requests.exceptions.Timeout("NPR feed timed out")
        elif "guardian" in url:
            resp.content = SAMPLE_GUARDIAN_XML
            return resp
        else:
            resp.content = b""
            return resp

    mock_get.side_effect = requests_side_effect

    # Run the aggregator fetch_all_feeds
    providers = [bbc_provider, npr_provider, guardian_provider]
    combined = fetch_all_feeds(providers)

    # We expect 2 from BBC, 0 from NPR, 1 from Guardian -> total 3 articles
    assert len(combined) == 3
    sources = [article.source for article in combined]
    assert sources.count("BBC News") == 2
    assert sources.count("The Guardian") == 1
    assert "NPR" not in sources
