from pathlib import Path
import os

from dotenv import load_dotenv


ML_SERVICE_DIR = (
    Path(__file__).resolve().parent.parent
)

ENV_PATH = (
    ML_SERVICE_DIR
    / ".env"
)

load_dotenv(
    dotenv_path=ENV_PATH,
    override=True,
)


MISTRAL_API_KEY = os.getenv(
    "MISTRAL_API_KEY"
)

MISTRAL_MODEL = os.getenv(
    "MISTRAL_MODEL",
    "mistral-small-latest",
)

MISTRAL_TEMPERATURE = float(
    os.getenv(
        "MISTRAL_TEMPERATURE",
        "0.4",
    )
)

MISTRAL_MAX_TOKENS = int(
    os.getenv(
        "MISTRAL_MAX_TOKENS",
        "500",
    )
)