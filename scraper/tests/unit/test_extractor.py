import pytest
from extraction.html_parser import HTMLParser

def test_html_parser_extracts_clean_text():
    parser = HTMLParser()
    html = "<html><body><article><p>Some important news.</p></article></body></html>"
    text = parser.extract_main_text(html)
    assert "important news" in text
