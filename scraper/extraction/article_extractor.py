from .article_fetcher import ArticleFetcher
from .html_parser import HTMLParser
from models.article import ArticleModel
from utils.logger import logger
from utils.helpers import generate_snippet

class ArticleExtractor:
    def __init__(self, fetcher: ArticleFetcher = None):
        self.fetcher = fetcher or ArticleFetcher()
        self.parser = HTMLParser()

    def extract(self, article: ArticleModel) -> ArticleModel:
        logger.info(f"Extracting full content for: {article.title}")
        html = self.fetcher.fetch(article.url)
        if html:
            extracted = self.parser.extract_article(html)
            article.body = extracted["body"]
            if extracted["title"]:
                article.title = extracted["title"]
            # If there was no summary or snippet from RSS, create one from body
            if not article.body_snippet:
                article.body_snippet = generate_snippet(article.body, 200)
        return article
