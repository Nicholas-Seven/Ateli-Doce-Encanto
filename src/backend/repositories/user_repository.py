from typing import Optional

from src.backend.database.connection import get_connection
from src.backend.models.user import User

class UserRepository:
    def create(self, user: User) -> User:
        """Salva um novo usuário."""
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO usuarios (nome, email, cpf, telefone, senha_hash)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (user.nome, user.email, user.cpf, user.telefone, user.senha_hash),
                )
                user.id = cursor.fetchone()[0]
        return user

    def find_by_email(self, email: str) -> Optional[User]:
        """Busca usuário por e-mail."""
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, nome, email, cpf, telefone, senha_hash
                    FROM usuarios
                    WHERE email = %s
                    """,
                    (email.lower(),),
                )
                row = cursor.fetchone()

                if not row:
                    return None

                return User(
                    id=row[0],
                    nome=row[1],
                    email=row[2],
                    cpf=row[3],
                    telefone=row[4],
                    senha_hash=row[5],
                )
