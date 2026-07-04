import re
import email.utils
from datetime import datetime, timezone
from urllib.parse import urlparse
from typing import Dict, Any, Union, List
from models.article import ArticleModel
from models.raw_rss_item import RawRSSItem
from utils.logger import logger

class ArticleNormalizer:
    def normalize(self, raw_item: Union[RawRSSItem, Dict[str, Any]]) -> ArticleModel:
        if isinstance(raw_item, RawRSSItem):
            data = raw_item.model_dump()
        else:
            data = raw_item

        logger.info(f"Normalizing raw item: {data.get('title', 'Untitled')}")

        def get_field(d: Dict[str, Any], keys: List[str]) -> Any:
            for k in keys:
                if k in d and d[k] is not None:
                    return d[k]
            return None

        # Resolve provider-specific fields
        title = get_field(data, ["title"])
        url = get_field(data, ["url", "link"])
        source = get_field(data, ["source", "provider", "publisher"])
        summary = get_field(data, ["summary", "description", "content"])
        published_at_raw = get_field(data, ["published_at", "published", "pubDate", "pub_date"])
        author = get_field(data, ["author"])

        # String cleaning helper
        def clean_string(s: Any) -> Any:
            if s is None:
                return None
            if not isinstance(s, str):
                s = str(s)
            # Remove duplicate whitespace (substitute with single space) and trim
            cleaned = re.sub(r'\s+', ' ', s).strip()
            # Remove empty strings
            if cleaned == "":
                return None
            return cleaned

        cleaned_title = clean_string(title)
        cleaned_url = clean_string(url)
        cleaned_source = clean_string(source)
        cleaned_summary = clean_string(summary)
        cleaned_author = clean_string(author)

        # Validate required fields
        if not cleaned_title:
            raise ValueError("Required field 'title' is missing or empty")
        if not cleaned_url:
            raise ValueError("Required field 'url' is missing or empty")
        if not cleaned_source:
            raise ValueError("Required field 'source' is missing or empty")
        if published_at_raw is None:
            raise ValueError("Required field 'published_at' is missing or empty")

        # Reject invalid URLs
        try:
            parsed_url = urlparse(cleaned_url)
            if not all([parsed_url.scheme, parsed_url.netloc]) or parsed_url.scheme not in ("http", "https"):
                raise ValueError(f"Invalid URL: {cleaned_url}")
        except Exception:
            raise ValueError(f"Invalid URL: {cleaned_url}")

        # Normalize datetime to UTC
        if isinstance(published_at_raw, datetime):
            dt = published_at_raw
        else:
            if not isinstance(published_at_raw, str):
                published_at_raw = str(published_at_raw)
            
            dt_str = published_at_raw.strip()
            if dt_str == "":
                raise ValueError("Required field 'published_at' is missing or empty")

            dt = None
            # 1. Try RFC 2822
            try:
                dt = email.utils.parsedate_to_datetime(dt_str)
            except Exception:
                pass

            # 2. Try ISO 8601
            if dt is None:
                try:
                    iso_str = dt_str
                    if iso_str.endswith('Z'):
                        iso_str = iso_str[:-1] + '+00:00'
                    dt = datetime.fromisoformat(iso_str)
                except Exception:
                    pass

            if dt is None:
                raise ValueError(f"Invalid published_at datetime format: {published_at_raw}")

        # Ensure UTC and convert to timezone-naive representation
        if dt.tzinfo is not None:
            dt_utc = dt.astimezone(timezone.utc).replace(tzinfo=None)
        else:
            dt_utc = dt

        return ArticleModel(
            title=cleaned_title,
            url=cleaned_url,
            source=cleaned_source,
            author=cleaned_author,
            body="", # Do NOT fetch article body
            body_snippet=cleaned_summary or "",
            summary=cleaned_summary,
            published_at=dt_utc
        )
