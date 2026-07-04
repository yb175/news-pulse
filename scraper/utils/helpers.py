import re

def clean_html(raw_html: str) -> str:
    """Removes script tags, style tags, and standardizes whitespace."""
    if not raw_html:
        return ""
    # Remove script and style elements
    clean = re.sub(r'<(script|style).*?>.*?</\1>', '', raw_html, flags=re.DOTALL | re.IGNORECASE)
    # Remove all HTML tags
    clean = re.sub(r'<[^>]*>', ' ', clean)
    # Normalize whitespaces
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def generate_snippet(text: str, max_length: int = 200) -> str:
    """Generates a snippet of text capped at a specific length."""
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    return text[:max_length].rstrip() + "..."
