from .rss_provider import RSSProvider

class GuardianProvider(RSSProvider):
    def __init__(self, feed_url: str = "https://www.theguardian.com/uk/rss"):
        super().__init__("The Guardian", feed_url)
