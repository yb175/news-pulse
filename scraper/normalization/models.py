# Helper models specifically for parsing validations or mapping
from typing import Dict, Any

class IngestionLog:
    def __init__(self, raw_data: Dict[str, Any]):
        self.raw_data = raw_data
