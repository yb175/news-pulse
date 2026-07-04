import time
import requests
from typing import Tuple
from utils.constants import USER_AGENT, REQUEST_TIMEOUT
from utils.logger import logger
from models import ArticleModel

class ArticleFetcher:
    def __init__(self, max_retries: int = 3, timeout: int = REQUEST_TIMEOUT, user_agent: str = USER_AGENT, backoff_factor: float = 0.5):
        self.max_retries = max_retries
        self.timeout = timeout
        self.headers = {"User-Agent": user_agent}
        self.backoff_factor = backoff_factor

    def fetch(self, url: str) -> str:
        """
        Fetches the HTML content from the given URL.
        Retries on transient failures (5xx, timeouts, connection errors) up to max_retries.
        Does NOT retry on non-transient failures (4xx, DNS/Connection issues that aren't transient).
        """
        retries = 0
        while True:
            try:
                logger.info(f"Fetching URL (attempt {retries + 1}/{self.max_retries + 1}): {url}")
                response = requests.get(url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
                
                # Check status code
                if response.status_code == 200:
                    return response.text
                
                # If 5xx, it's transient, so retry
                if 500 <= response.status_code < 600:
                    logger.warning(f"Transient server error {response.status_code} for URL {url}.")
                    if retries >= self.max_retries:
                        logger.error(f"Failed to fetch {url} after {self.max_retries} retries due to status {response.status_code}.")
                        response.raise_for_status()
                else:
                    # 3xx, 4xx or other status codes are non-transient, raise immediately
                    logger.error(f"Non-transient HTTP status {response.status_code} for URL {url}.")
                    response.raise_for_status()
                    # Fallback raise in case raise_for_status doesn't raise (e.g. 3xx)
                    raise requests.exceptions.HTTPError(f"HTTP Status {response.status_code}", response=response)
                    
            except requests.exceptions.HTTPError as e:
                if e.response is not None and 500 <= e.response.status_code < 600:
                    logger.error(f"Transient server error exhausted all retries for URL {url}: {e}")
                else:
                    logger.error(f"Non-transient HTTP error for URL {url}: {e}")
                raise e
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                if retries >= self.max_retries:
                    logger.error(f"Transient connection/timeout error exhausted all retries for URL {url}: {e}")
                    raise e
                logger.warning(f"Transient connection/timeout error for URL {url}: {e}")
            except requests.exceptions.RequestException as e:
                logger.error(f"Non-transient request exception for URL {url}: {e}")
                raise e

            # Apply backoff delay if not exhausted
            retries += 1
            if self.backoff_factor > 0:
                time.sleep(self.backoff_factor * (2 ** (retries - 1)))

    def fetch_article(self, article: ArticleModel) -> Tuple[ArticleModel, str]:
        """
        Fetches the HTML content for an article.
        Returns a tuple of (ArticleModel, raw_html).
        """
        html = self.fetch(article.url)
        return article, html
