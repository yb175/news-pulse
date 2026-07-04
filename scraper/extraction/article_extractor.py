from .article_fetcher import ArticleFetcher
from .html_parser import HTMLParser
from models.article import ArticleModel
from utils.logger import logger
from utils.helpers import generate_snippet

class ArticleExtractor:
    def __init__(self):
        self.fetcher = ArticleFetcher()
        self.parser = HTMLParser()

    def extract(self, article: ArticleModel) -> ArticleModel:
        logger.info(f"Extracting full content for: {article.title}")
        html = self.fetcher.fetch(article.url)
        if html:
            body = self.parser.extract_main_text(html)
            article.body = body
            # If there was no summary or snippet from RSS, create one from body
            if not article.body_snippet:
                article.body_snippet = generate_snippet(body, 200)
        return article
