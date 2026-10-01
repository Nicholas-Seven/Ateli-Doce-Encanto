from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    """Modelo de domínio para Usuário (Cliente da Doceria)."""
    nome: str
    email: str
    senha_hash: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    id: Optional[int] = None
