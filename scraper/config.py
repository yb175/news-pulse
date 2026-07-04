import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/newspulse?schema=public")
if "schema=" in DATABASE_URL:
    if "?" in DATABASE_URL:
        base_url, query = DATABASE_URL.split("?", 1)
        params = [p for p in query.split("&") if not p.startswith("schema=")]
        DATABASE_URL = base_url + ("?" + "&".join(params) if params else "")
SCRAPER_INTERVAL_MINUTES = int(os.getenv("SCRAPER_INTERVAL_MINUTES", "60"))

# RSS Feeds to monitor
RSS_FEEDS = {
    "BBC News": "http://feeds.bbci.co.uk/news/rss.xml",
    "The Guardian": "https://www.theguardian.com/uk/rss",
    "NPR": "https://feeds.npr.org/1001/rss.xml"
}
