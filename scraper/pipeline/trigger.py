from utils.logger import logger
from pipeline.pipeline import NewsPipeline

def trigger_run():
    logger.info("Manual run triggered from system command.")
    pipeline = NewsPipeline()
    return pipeline.run()

if __name__ == "__main__":
    trigger_run()
