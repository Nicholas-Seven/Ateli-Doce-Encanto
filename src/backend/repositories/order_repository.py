from typing import Any, Dict, List, Optional

from src.backend.database.connection import get_connection


class OrderRepository:
    def create(
        self,
        total: float,
        items: List[Dict[str, Any]],
        user_id: Optional[int] = None,
    ) -> int:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT set_config('app.user_id', %s, true)",
                    (str(user_id),),
                )
                cursor.execute(
                    """
                    INSERT INTO pedidos (usuario_id, total)
                    VALUES (%s, %s)
                    RETURNING id
                    """,
                    (user_id, total),
                )
                order_id = cursor.fetchone()[0]

                for item in items:
                    cursor.execute(
                        """
                        INSERT INTO itens_pedido
                            (pedido_id, produto_id, quantidade, preco_unitario)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (
                            order_id,
                            item["product_id"],
                            item["quantidade"],
                            item["preco_oficial"],
                        ),
                    )

                return order_id
