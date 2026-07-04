import psycopg2
from typing import List
import config
from utils.logger import logger
from models.article import ArticleModel
from models.cluster import ClusterModel

class DatabaseRepository:
    def __init__(self):
        self.conn_str = config.DATABASE_URL

    def _get_connection(self):
        return psycopg2.connect(self.conn_str)

    def get_existing_urls(self) -> List[str]:
        logger.info("Retrieving existing article URLs from PostgreSQL...")
        urls = []
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute('SELECT "url" FROM "Article";')
                    urls = [row[0] for row in cur.fetchall()]
        except Exception as e:
            logger.error(f"Failed to query existing URLs: {e}")
        return urls

    def get_existing_clusters(self) -> List[ClusterModel]:
        logger.info("Retrieving existing clusters from PostgreSQL...")
        clusters = []
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute('SELECT "id", "title", "summary" FROM "Cluster";')
                    for row in cur.fetchall():
                        clusters.append(ClusterModel(
                            id=row[0],
                            title=row[1],
                            summary=row[2]
                        ))
        except Exception as e:
            logger.error(f"Failed to query existing clusters: {e}")
        return clusters
