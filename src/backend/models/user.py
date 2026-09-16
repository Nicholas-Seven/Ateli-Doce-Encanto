from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    """Modelo de domínio para Usuário (Cliente da Doceria)."""
    nome: str
    email: str
    cpf: str
    telefone: str
    senha_hash: str
    id: Optional[int] = None
