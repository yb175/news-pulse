import logging
import sys

def setup_logger(name: str = "scraper") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create console handler and set level to info
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Add formatter to ch
        ch.setFormatter(formatter)
        
        # Add ch to logger
        logger.addHandler(ch)
        
    return logger

logger = setup_logger()
