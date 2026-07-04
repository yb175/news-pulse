import pytest
from pipeline.pipeline import NewsPipeline

def test_pipeline_execution():
    pipeline = NewsPipeline()
    stats = pipeline.run()
    assert stats["status"] == "success"
    assert "articles_fetched" in stats
