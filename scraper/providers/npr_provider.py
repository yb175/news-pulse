from .rss_provider import RSSProvider

class NPRProvider(RSSProvider):
    def __init__(self, feed_url: str = "https://feeds.npr.org/1001/rss.xml"):
        super().__init__("NPR", feed_url)
