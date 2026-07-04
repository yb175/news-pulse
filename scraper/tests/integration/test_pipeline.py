import pytest
from unittest.mock import patch, MagicMock
from pipeline.pipeline import NewsPipeline

@patch("persistence.writer.DatabaseWriter.write_article")
@patch("persistence.writer.DatabaseWriter.get_or_create_cluster")
@patch("persistence.writer.DatabaseWriter.ensure_unique_index")
@patch("persistence.repository.DatabaseRepository.get_existing_clusters")
@patch("persistence.repository.DatabaseRepository.get_existing_urls")
@patch("requests.get")
def test_pipeline_execution(mock_get, mock_get_urls, mock_get_clusters, mock_ensure_idx, mock_get_or_create_cluster, mock_write_article):
    mock_get_urls.return_value = []
    mock_get_clusters.return_value = []
    mock_get_or_create_cluster.return_value = "cluster-id-123"
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b"""<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <item>
          <title>Integrate Article</title>
          <link>https://example.com/integrate</link>
          <pubDate>Sat, 04 Jul 2026 08:00:00 GMT</pubDate>
          <description>Integrate Summary</description>
        </item>
      </channel>
    </rss>
    """
    mock_response.text = "<html><body><article><h1>Integrate Article</h1><p>This is the extracted body.</p></article></body></html>"
    mock_get.return_value = mock_response

    pipeline = NewsPipeline()
    stats = pipeline.run()
    assert stats["status"] == "success"
    assert stats["articles_fetched"] == 3  # 3 providers * 1 article each
    assert stats["articles_normalized"] == 3
    assert stats["articles_extracted"] == 3
    assert stats["articles_persisted"] == 1


