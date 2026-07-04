import requests
from utils.constants import USER_AGENT, REQUEST_TIMEOUT
from utils.logger import logger

class ArticleFetcher:
    def __init__(self):
        self.headers = {"User-Agent": USER_AGENT}

    def fetch(self, url: str) -> str:
        logger.info(f"Fetching full page content from {url}...")
        try:
            response = requests.get(url, headers=self.headers, timeout=REQUEST_TIMEOUT)
            if response.status_code == 200:
                return response.text
            else:
                logger.warning(f"Failed to fetch {url}. Status code: {response.status_code}")
                return ""
        except Exception as e:
            logger.error(f"Error fetching URL {url}: {e}")
            return ""
