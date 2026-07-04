import time
from utils.logger import logger
from pipeline.pipeline import NewsPipeline
import config

def start_scheduler():
    logger.info(f"Starting scheduler. Interval: {config.SCRAPER_INTERVAL_MINUTES} minutes")
    pipeline = NewsPipeline()
    while True:
        try:
            logger.info("Scheduler triggering a new pipeline run...")
            pipeline.run()
        except Exception as e:
            logger.error(f"Error in scheduled execution: {e}")
        
        # Sleep for the configured interval
        time.sleep(config.SCRAPER_INTERVAL_MINUTES * 60)

if __name__ == "__main__":
    start_scheduler()
