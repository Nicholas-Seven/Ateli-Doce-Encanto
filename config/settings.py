import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Configurações da aplicação."""
    PORT = int(os.getenv("PORT", 5000))
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    SECRET_KEY = os.getenv("SECRET_KEY")
    if FLASK_ENV == "production" and not SECRET_KEY:
        raise RuntimeError("Defina SECRET_KEY com um segredo forte no ambiente de produção.")
    SECRET_KEY = SECRET_KEY or "chave_padrao_desenvolvimento"
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/doceria_db")
    
    # Padrão CID: Disponibilidade - Limite de requisições por minuto
    RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", 5))

settings = Settings()
