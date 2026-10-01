from contextlib import contextmanager
from urllib.parse import urlparse

import psycopg2

try:
    from config.settings import settings
except ModuleNotFoundError:  # pragma: no cover - fallback for package-style runs
    from src.backend.config.settings import settings


def _connection_options(database_url: str) -> dict:
    hostname = urlparse(database_url).hostname or ""
    if hostname == "neon.tech" or hostname.endswith(".neon.tech"):
        return {"sslmode": "require"}
    return {}


@contextmanager
def get_connection():
    connection = psycopg2.connect(
        settings.DATABASE_URL,
        **_connection_options(settings.DATABASE_URL),
    )
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
