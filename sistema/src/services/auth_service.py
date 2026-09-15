import hashlib
import re
from src.models.user import User
from src.repositories.user_repository import UserRepository

class AuthService:
    """
    Serviço de Autenticação para clientes da Doceria.
    Implementa validações e tratamento seguro de credenciais.
    """
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository

    def _hash_password(self, password: str) -> str:
        """Gera hash SHA-256 da senha."""
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def register(self, nome: str, email: str, cpf: str, telefone: str, senha: str) -> User:
        """Registra novo usuário validando consistência básica."""
        if not nome or not email or not cpf or not telefone or not senha:
            raise ValueError("Todos os campos obrigatórios devem ser preenchidos.")

        # Limite de tamanho no nível de serviço
        if len(nome) > 100 or len(email) > 120 or len(cpf) > 14 or len(telefone) > 15:
            raise ValueError("Tamanho de campo excede o limite máximo permitido.")

        # Validação de formato
        if self.user_repo.find_by_email(email):
            raise ValueError("Já existe um cadastro com este e-mail.")

        senha_hash = self._hash_password(senha)
        novo_usuario = User(
            nome=nome.strip(),
            email=email.strip().lower(),
            cpf=cpf.strip(),
            telefone=telefone.strip(),
            senha_hash=senha_hash
        )
        return self.user_repo.create(novo_usuario)

    def login(self, email: str, senha: str) -> User:
        """Autentica o usuário."""
        if not email or not senha:
            raise ValueError("E-mail e senha são obrigatórios.")

        user = self.user_repo.find_by_email(email.strip().lower())
        if not user:
            raise ValueError("Credenciais inválidas.")

        if user.senha_hash != self._hash_password(senha):
            raise ValueError("Credenciais inválidas.")

        return user
