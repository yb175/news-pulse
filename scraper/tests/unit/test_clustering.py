import pytest
from datetime import datetime
from unittest.mock import MagicMock, patch
import psycopg2.errors
from clustering.keyword_cluster_strategy import KeywordClusterStrategy
from models import ArticleModel, ClusterModel
from persistence.writer import DatabaseWriter

def test_same_topic_grouped():
    strategy = KeywordClusterStrategy()
    existing = [
        ClusterModel(id="cluster-1", title="Quantum Computing Breakthrough", summary="")
    ]
    articles = [
        ArticleModel(title="Quantum Breakthrough Reached", url="url-1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    clustered = strategy.cluster_articles(articles, existing)
    assert clustered[0].cluster_id == "cluster-1"

def test_different_topic_separated():
    strategy = KeywordClusterStrategy()
    existing = [
        ClusterModel(id="cluster-1", title="Quantum Computing Breakthrough", summary="")
    ]
    articles = [
        ArticleModel(title="Local Soccer Team Wins Match", url="url-2", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    clustered = strategy.cluster_articles(articles, existing)
    assert clustered[0].cluster_id != "cluster-1"

def test_cluster_creation_on_mismatch():
    strategy = KeywordClusterStrategy()
    existing = []
    articles = [
        ArticleModel(title="Quantum Computing Breakthrough", url="url-1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    clustered = strategy.cluster_articles(articles, existing, writer=None)
    assert clustered[0].cluster_id is not None
    assert clustered[0].cluster_id != ""

def test_multiple_articles_same_topic_in_batch():
    strategy = KeywordClusterStrategy()
    existing = []
    articles = [
        ArticleModel(title="Scientists Discover New Particle", url="url-1", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
        ArticleModel(title="New Particle Discovered by Scientists", url="url-2", source="S", body="", body_snippet="", published_at=datetime.utcnow()),
    ]
    clustered = strategy.cluster_articles(articles, existing, writer=None)
    assert clustered[0].cluster_id is not None
    assert clustered[1].cluster_id == clustered[0].cluster_id

@patch("persistence.writer.DatabaseWriter.ensure_unique_index")
def test_database_writer_get_or_create_cluster_success(mock_ensure):
    writer = DatabaseWriter()
    
    mock_conn = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_cur = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur
    mock_cur.fetchone.side_effect = [None]
    
    with patch.object(writer, "_get_connection", return_value=mock_conn):
        cluster_id = writer.get_or_create_cluster("Success Title", "Summary")
        assert cluster_id is not None
        assert mock_cur.execute.call_count == 2
        assert "SELECT" in mock_cur.execute.call_args_list[0][0][0]
        assert "INSERT" in mock_cur.execute.call_args_list[1][0][0]

@patch("persistence.writer.DatabaseWriter.ensure_unique_index")
def test_database_writer_get_or_create_cluster_duplicate_race(mock_ensure):
    writer = DatabaseWriter()
    
    mock_conn = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_cur = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur
    
    mock_cur.fetchone.side_effect = [None, ("existing-id-123",)]
    mock_cur.execute.side_effect = [
        None,
        psycopg2.errors.UniqueViolation("duplicate key value violates unique constraint"),
        None
    ]
    
    with patch.object(writer, "_get_connection", return_value=mock_conn):
        cluster_id = writer.get_or_create_cluster("Race Title", "Summary")
        assert cluster_id == "existing-id-123"
        assert mock_cur.execute.call_count == 3
