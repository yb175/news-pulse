from bs4 import BeautifulSoup
from utils.logger import logger
from utils.helpers import clean_html

class HTMLParser:
    def extract_main_text(self, html_content: str) -> str:
        if not html_content:
            return ""
        
        logger.info("Parsing HTML content with BeautifulSoup...")
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove scripts, styles, footers, headers, and nav panels
            for element in soup(["script", "style", "nav", "header", "footer", "aside"]):
                element.decompose()

            # Attempt to find main container tags commonly used by publishers
            article_content = ""
            main_article = soup.find('article') or soup.find(id='main-content') or soup.find(class_='article-body')
            
            if main_article:
                article_content = main_article.get_text()
            else:
                article_content = soup.get_text()

            return clean_html(article_content)
        except Exception as e:
            logger.error(f"Error parsing HTML: {e}")
            return ""
