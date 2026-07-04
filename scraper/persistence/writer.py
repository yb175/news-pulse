import psycopg2
from datetime import datetime
import config
from utils.logger import logger
from models.article import ArticleModel
from models.cluster import ClusterModel
from models.ingestion_job import IngestionJobModel

class DatabaseWriter:
    def __init__(self):
        self.conn_str = config.DATABASE_URL

    def _get_connection(self):
        return psycopg2.connect(self.conn_str)

    def write_cluster(self, cluster: ClusterModel) -> str:
        logger.info(f"Writing cluster '{cluster.title}' to PostgreSQL...")
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        'INSERT INTO "Cluster" ("id", "title", "summary", "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s) RETURNING "id";',
                        (cluster.id, cluster.title, cluster.summary, cluster.created_at, cluster.updated_at)
                    )
                    cluster_id = cur.fetchone()[0]
                    conn.commit()
                    return cluster_id
        except Exception as e:
            logger.error(f"Failed to save cluster: {e}")
            raise e

    def write_article(self, article: ArticleModel):
        logger.info(f"Writing article '{article.title}' to PostgreSQL...")
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        'INSERT INTO "Article" ("id", "title", "url", "source", "author", "body", "bodySnippet", "publishedAt", "scrapedAt", "clusterId") VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);',
                        (
                            article.id,
                            article.title,
                            article.url,
                            article.source,
                            article.author,
                            article.body,
                            article.body_snippet,
                            article.published_at,
                            article.scraped_at,
                            article.cluster_id
                        )
                    )
                    conn.commit()
        except Exception as e:
            logger.error(f"Failed to save article: {e}")

    def write_ingestion_job(self, job: IngestionJobModel):
        logger.info(f"Writing ingestion job {job.id} to PostgreSQL...")
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        'INSERT INTO "IngestionJob" ("id", "status", "startedAt", "completedAt", "articlesFound", "logs") VALUES (%s, %s, %s, %s, %s, %s);',
                        (job.id, job.status, job.started_at, job.completed_at, job.articles_found, job.logs)
                    )
                    conn.commit()
        except Exception as e:
            logger.error(f"Failed to save ingestion job: {e}")
