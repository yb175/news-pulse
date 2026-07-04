import pytest
from extraction.html_parser import HTMLParser

def test_normal_article():
    parser = HTMLParser()
    html = """
    <html>
      <head>
        <title>HTML Title</title>
      </head>
      <body>
        <article>
          <h1>Article Title</h1>
          <p>This is the first paragraph.</p>
          <p>This is the second paragraph.</p>
        </article>
      </body>
    </html>
    """
    res = parser.extract_article(html)
    assert res["title"] == "Article Title"
    assert "This is the first paragraph. This is the second paragraph." in res["body"]

def test_missing_body():
    parser = HTMLParser()
    html = """
    <html>
      <head>
        <title>Title Only</title>
      </head>
      <body>
        <article></article>
      </body>
    </html>
    """
    res = parser.extract_article(html)
    assert res["title"] == "Title Only"
    assert res["body"] == ""

def test_malformed_html():
    parser = HTMLParser()
    # Unclosed tags, mismatched nesting
    html = """
    <html>
      <body>
        <article>
          <h1>Malformed Title
          <p>Paragraph text without body closing
        </article>
    """
    res = parser.extract_article(html)
    assert "Malformed Title" in res["title"]
    assert "Paragraph text without body closing" in res["body"]

def test_scripts_removed():
    parser = HTMLParser()
    html = """
    <html>
      <body>
        <article>
          <h1>Title</h1>
          <script type="text/javascript">
            alert("should be removed");
          </script>
          <p>Real text content.</p>
        </article>
      </body>
    </html>
    """
    res = parser.extract_article(html)
    assert "alert" not in res["body"]
    assert "Real text content" in res["body"]

def test_style_removed():
    parser = HTMLParser()
    html = """
    <html>
      <body>
        <article>
          <h1>Title</h1>
          <style>
            body { color: red; }
          </style>
          <p>Clean text body.</p>
        </article>
      </body>
    </html>
    """
    res = parser.extract_article(html)
    assert "color: red" not in res["body"]
    assert "Clean text body" in res["body"]

def test_body_cleaned():
    parser = HTMLParser()
    html = """
    <html>
      <body>
        <nav>
          <a href="/home">Home</a>
        </nav>
        <div id="sidebar" class="sidebar">
          <ul><li>Related stories</li></ul>
        </div>
        <article>
          <h1>Title</h1>
          <div class="ad-banner">
            Buy this product!
          </div>
          <p>This is the actual article content.</p>
          <div class="sponsor-notice">
            Sponsored by Us
          </div>
        </article>
        <footer>
          <p>Copyright 2026</p>
        </footer>
      </body>
    </html>
    """
    res = parser.extract_article(html)
    # Checks that navigation, sidebar, ads, footer, and sponsor blocks are all cleaned out
    assert "Home" not in res["body"]
    assert "Related stories" not in res["body"]
    assert "Buy this product" not in res["body"]
    assert "Sponsored by Us" not in res["body"]
    assert "Copyright" not in res["body"]
    assert res["body"] == "Title This is the actual article content."

def test_html_parser_extracts_clean_text_backwards_compatibility():
    parser = HTMLParser()
    html = "<html><body><article><p>Some important news.</p></article></body></html>"
    text = parser.extract_main_text(html)
    assert "important news" in text
