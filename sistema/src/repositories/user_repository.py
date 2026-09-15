from typing import Optional, List
from src.models.user import User

class UserRepository:
    """
    Repositório de Usuários.
    Preparado para PostgreSQL (quando o banco for configurado com o script schema.sql).
    """
    def __init__(self, db_connection=None):
        self.db = db_connection
        self._users: List[User] = []

    def create(self, user: User) -> User:
        """Salva um novo usuário."""
        if self.db:
            # Exemplo PostgreSQL:
            # cursor = self.db.cursor()
            # cursor.execute(
            #     "INSERT INTO usuarios (nome, email, cpf, telefone, senha_hash) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            #     (user.nome, user.email, user.cpf, user.telefone, user.senha_hash)
            # )
            pass
        user.id = len(self._users) + 1
        self._users.append(user)
        return user

    def find_by_email(self, email: str) -> Optional[User]:
        """Busca usuário por e-mail."""
        for u in self._users:
            if u.email.lower() == email.lower():
                return u
        return None
