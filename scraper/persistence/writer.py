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
        self.ensure_unique_index()

    def _get_connection(self):
        return psycopg2.connect(self.conn_str)

    def ensure_unique_index(self):
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute('CREATE UNIQUE INDEX IF NOT EXISTS "Cluster_title_key" ON "Cluster"("title");')
                    conn.commit()
        except Exception as e:
            logger.critical(f"Could not ensure unique index on Cluster(title): {e}")
            raise e

    def get_or_create_cluster(self, title: str, summary: str = "") -> str:
        """
        Gets a cluster by title, or creates a new one.
        Handles concurrency races using PostgreSQL unique constraints and transactions.
        If a UniqueViolation is raised, it rolls back, retries the lookup, and returns the existing cluster ID.
        If the concurrent transaction is rolled back, the lookup retry returns None, so the loop repeats.
        """
        normalized_title = title.strip()
        
        for attempt in range(3):
            # 1. Attempt to find existing cluster by title
            try:
                with self._get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute('SELECT "id" FROM "Cluster" WHERE "title" = %s;', (normalized_title,))
                        row = cur.fetchone()
                        if row:
                            return row[0]
            except Exception as e:
                logger.warning(f"Error checking for existing cluster '{normalized_title}': {e}")

            # 2. If not found, attempt to insert a new cluster
            import uuid
            cluster_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            try:
                with self._get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            'INSERT INTO "Cluster" ("id", "title", "summary", "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s);',
                            (cluster_id, normalized_title, summary, now, now)
                        )
                        conn.commit()
                        logger.info(f"Successfully created new cluster '{normalized_title}' with ID {cluster_id}")
                        return cluster_id
            except psycopg2.errors.UniqueViolation as e:
                logger.warning(f"Conflict detected: Cluster '{normalized_title}' was created concurrently. Retrying lookup (attempt {attempt + 1})...")
                try:
                    with self._get_connection() as conn:
                        with conn.cursor() as cur:
                            cur.execute('SELECT "id" FROM "Cluster" WHERE "title" = %s;', (normalized_title,))
                            row = cur.fetchone()
                            if row:
                                logger.info(f"Concurrently created cluster resolved: '{normalized_title}' -> ID {row[0]}")
                                return row[0]
                except Exception as lookup_err:
                    logger.error(f"Failed to retrieve concurrent cluster after conflict: {lookup_err}")
                    raise lookup_err
            except Exception as e:
                logger.error(f"Unexpected error creating cluster '{normalized_title}': {e}")
                raise e
        
        raise RuntimeError(f"Failed to get or create cluster '{normalized_title}' after 3 attempts")

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
        if not article.id:
            import uuid
            article.id = str(uuid.uuid4())
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
            raise e

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
