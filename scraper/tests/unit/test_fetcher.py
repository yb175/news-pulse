import pytest
from unittest.mock import patch, MagicMock
import requests
from datetime import datetime
from extraction.article_fetcher import ArticleFetcher
from models import ArticleModel

def test_successful_fetch():
    fetcher = ArticleFetcher(max_retries=0)
    
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "<html>Content</html>"
        mock_get.return_value = mock_response
        
        html = fetcher.fetch("https://example.com/success")
        
        assert html == "<html>Content</html>"
        mock_get.assert_called_once_with(
            "https://example.com/success",
            headers={"User-Agent": fetcher.headers["User-Agent"]},
            timeout=fetcher.timeout,
            allow_redirects=True
        )

def test_timeout_raised():
    fetcher = ArticleFetcher(max_retries=0)
    
    with patch("requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.Timeout("Read timed out")
        
        with pytest.raises(requests.exceptions.Timeout):
            fetcher.fetch("https://example.com/timeout")

def test_dns_failure_raised():
    fetcher = ArticleFetcher(max_retries=0)
    
    with patch("requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.ConnectionError("Failed to resolve DNS")
        
        with pytest.raises(requests.exceptions.ConnectionError):
            fetcher.fetch("https://example.com/dns-fail")

def test_404_not_found():
    fetcher = ArticleFetcher(max_retries=3) # Even with retries, 404 should fail immediately
    
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("404 Client Error")
        mock_get.return_value = mock_response
        
        with pytest.raises(requests.exceptions.HTTPError):
            fetcher.fetch("https://example.com/404")
        
        # Should not retry 4xx errors
        assert mock_get.call_count == 1

def test_500_internal_server_error_eventually_raised():
    fetcher = ArticleFetcher(max_retries=2, backoff_factor=0.0)
    
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("500 Server Error")
        mock_get.return_value = mock_response
        
        with pytest.raises(requests.exceptions.HTTPError):
            fetcher.fetch("https://example.com/500")
            
        # 1 initial attempt + 2 retries = 3 attempts total
        assert mock_get.call_count == 3

def test_redirect_supported():
    fetcher = ArticleFetcher(max_retries=0)
    
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "Redirected content"
        mock_get.return_value = mock_response
        
        html = fetcher.fetch("https://example.com/redirect-source")
        assert html == "Redirected content"
        
        # Verify allow_redirects=True is passed
        _, kwargs = mock_get.call_args
        assert kwargs["allow_redirects"] is True

def test_retry_works():
    fetcher = ArticleFetcher(max_retries=3, backoff_factor=0.0)
    
    with patch("requests.get") as mock_get:
        # First call fails with 503, second call succeeds with 200
        mock_fail = MagicMock()
        mock_fail.status_code = 503
        
        mock_success = MagicMock()
        mock_success.status_code = 200
        mock_success.text = "Recovered content"
        
        mock_get.side_effect = [mock_fail, mock_success]
        
        html = fetcher.fetch("https://example.com/retry-success")
        
        assert html == "Recovered content"
        assert mock_get.call_count == 2

def test_retry_exhausted():
    fetcher = ArticleFetcher(max_retries=2, backoff_factor=0.0)
    
    with patch("requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.Timeout("Timeout")
        
        with pytest.raises(requests.exceptions.Timeout):
            fetcher.fetch("https://example.com/exhausted")
            
        # 1 initial + 2 retries = 3 attempts total
        assert mock_get.call_count == 3

def test_skipped_article_continues_pipeline():
    fetcher = ArticleFetcher(max_retries=0)
    
    # Setup list of 3 articles: first and third succeed, second fails
    articles = [
        ArticleModel(title="Art 1", url="https://example.com/1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="Art 2", url="https://example.com/2", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="Art 3", url="https://example.com/3", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    
    def mock_requests_get(url, **kwargs):
        resp = MagicMock()
        if "1" in url:
            resp.status_code = 200
            resp.text = "Content 1"
            return resp
        elif "2" in url:
            # DNS/connection failure
            raise requests.exceptions.ConnectionError("Failed")
        elif "3" in url:
            resp.status_code = 200
            resp.text = "Content 3"
            return resp
        raise ValueError("Unknown URL")
        
    with patch("requests.get", side_effect=mock_requests_get):
        fetched_results = []
        for art in articles:
            try:
                _, html = fetcher.fetch_article(art)
                fetched_results.append((art.title, html))
            except Exception:
                # Log and skip (simulating failure policy)
                pass
                
        # Asserts: skipped article 2, but processed article 1 and 3 successfully
        assert len(fetched_results) == 2
        assert fetched_results[0] == ("Art 1", "Content 1")
        assert fetched_results[1] == ("Art 3", "Content 3")

def test_custom_headers_sent():
    custom_agent = "CustomNewsPulseBot/2.0"
    fetcher = ArticleFetcher(max_retries=0, user_agent=custom_agent)
    
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "Content"
        mock_get.return_value = mock_response
        
        fetcher.fetch("https://example.com")
        
        _, kwargs = mock_get.call_args
        assert kwargs["headers"]["User-Agent"] == custom_agent
