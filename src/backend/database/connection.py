from contextlib import contextmanager

import psycopg2

from src.backend.config.settings import settings


@contextmanager
def get_connection():
    connection = psycopg2.connect(settings.DATABASE_URL)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
