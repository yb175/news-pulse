import re
from bs4 import BeautifulSoup
from utils.logger import logger
from utils.helpers import clean_html
from typing import Dict

class HTMLParser:
    def extract_article(self, html_content: str) -> Dict[str, str]:
        """
        Parses HTML and extracts a dictionary with:
        - title
        - body (cleaned main text)
        """
        if not html_content:
            return {"title": "", "body": ""}

        logger.info("Parsing HTML content with BeautifulSoup...")
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # 1. Extract title
            # Priority: <h1> tag, then <title> tag, then empty string
            title = ""
            h1_el = soup.find('h1')
            if h1_el:
                title_parts = []
                for child in list(h1_el.contents):
                    if isinstance(child, str):
                        title_parts.append(child)
                        child.extract()
                    elif child.name not in ["p", "div", "article", "section"]:
                        title_parts.append(child.get_text())
                        child.decompose()
                title = "".join(title_parts)
            elif soup.title:
                title = soup.title.string or ""
                
            # Clean title
            title = re.sub(r'\s+', ' ', title).strip()

            # 2. Decompose unwanted structural elements
            # Remove scripts, styles
            for element in soup(["script", "style"]):
                element.decompose()
                
            # Remove navigation, headers, footers, asides
            for tag in ["nav", "header", "footer", "aside"]:
                for element in soup.find_all(tag):
                    element.decompose()
            
            # Decompose common nav/footer/sidebar class/ids
            nav_footer_pattern = re.compile(r"nav|menu|sidebar|footer", re.I)
            for element in soup.find_all(attrs={"class": nav_footer_pattern}):
                element.decompose()
            for element in soup.find_all(attrs={"id": nav_footer_pattern}):
                element.decompose()

            # Decompose ads/sponsored blocks
            ads_pattern = re.compile(r"ad-|promo|sponsor|banner|advert", re.I)
            for element in soup.find_all(attrs={"class": ads_pattern}):
                element.decompose()
            for element in soup.find_all(attrs={"id": ads_pattern}):
                element.decompose()

            # 3. Locate body content container
            main_article = (
                soup.find('article') or 
                soup.find(id=re.compile(r"article|entry|post|main-content", re.I)) or 
                soup.find(class_=re.compile(r"article-body|post-body|entry-content|main-content", re.I))
            )
            
            if main_article:
                body_raw = main_article.get_text()
            else:
                body_element = soup.find('body') or soup
                body_raw = body_element.get_text()

            # 4. Clean body text
            cleaned_body = clean_html(body_raw)

            return {
                "title": title,
                "body": cleaned_body
            }
        except Exception as e:
            logger.error(f"Error parsing HTML: {e}")
            return {"title": "", "body": ""}

    def extract_main_text(self, html_content: str) -> str:
        """Fallback method for backwards compatibility."""
        return self.extract_article(html_content)["body"]
