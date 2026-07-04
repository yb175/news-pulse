import sys
from utils.logger import logger
from pipeline.pipeline import NewsPipeline

def main():
    logger.info("Initializing News Ingestion Scraper...")
    try:
        pipeline = NewsPipeline()
        logger.info("Running news pipeline job...")
        stats = pipeline.run()
        logger.info(f"Ingestion pipeline completed. Stats: {stats}")
    except Exception as e:
        logger.error(f"Failed to execute pipeline: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
