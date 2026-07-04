from .rss_provider import RSSProvider

class BBCProvider(RSSProvider):
    def __init__(self, feed_url: str = "http://feeds.bbci.co.uk/news/rss.xml"):
        super().__init__("BBC News", feed_url)
