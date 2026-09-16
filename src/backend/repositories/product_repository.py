from typing import List, Optional

from src.backend.database.connection import get_connection
from src.backend.models.product import Product

class ProductRepository:
    def find_all(self) -> List[Product]:
        """Retorna todos os bolos disponíveis do catálogo."""
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, nome, descricao, preco, categoria, imagem_url, disponivel
                    FROM produtos
                    WHERE disponivel = TRUE
                    ORDER BY id
                    """
                )
                return [self._to_product(row) for row in cursor.fetchall()]

    def find_by_id(self, product_id: int) -> Optional[Product]:
        """Busca um produto pelo ID para validação oficial de preço (Integridade)."""
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, nome, descricao, preco, categoria, imagem_url, disponivel
                    FROM produtos
                    WHERE id = %s AND disponivel = TRUE
                    """,
                    (product_id,),
                )
                row = cursor.fetchone()
                return self._to_product(row) if row else None

    @staticmethod
    def _to_product(row) -> Product:
        return Product(
            id=row[0],
            nome=row[1],
            descricao=row[2],
            preco=float(row[3]),
            categoria=row[4],
            imagem_url=row[5],
            disponivel=row[6],
        )
