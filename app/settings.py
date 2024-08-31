import logging
from typing import List

OPENAI_API_KEY: str
ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
LOG_LEVEL: str = "INFO"

# Logger configuration
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Create a logger instance
logger = logging.getLogger(__name__)
