from typing import List, Optional

from src.backend.database.connection import get_connection
from src.backend.models.product import Product

class ProductRepository:
    @staticmethod
    def _resolve_table_name() -> str:
        for table_name in ("public.produtos", "produtos", "public.products", "products"):
            try:
                with get_connection() as connection:
                    with connection.cursor() as cursor:
                        cursor.execute(f"SELECT 1 FROM {table_name} LIMIT 1")
                return table_name
            except Exception:
                continue
        return "public.produtos"

    def find_all(self) -> List[Product]:
        """Retorna todos os bolos disponíveis do catálogo."""
        table_name = self._resolve_table_name()
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    SELECT id, nome, descricao, preco, categoria, imagem_url, disponivel
                    FROM {table_name}
                    WHERE disponivel = TRUE
                    ORDER BY id
                    """
                )
                return [self._to_product(row) for row in cursor.fetchall()]

    def find_by_id(self, product_id: int) -> Optional[Product]:
        """Busca um produto pelo ID para validação oficial de preço (Integridade)."""
        table_name = self._resolve_table_name()
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    SELECT id, nome, descricao, preco, categoria, imagem_url, disponivel
                    FROM {table_name}
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
