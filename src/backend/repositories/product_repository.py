from typing import List, Optional
from src.backend.models.product import Product

class ProductRepository:
    """
    Repositório de Produtos.
    Preparado para PostgreSQL (quando você conectar sua string de conexão DATABASE_URL).
    Possui os dados padrão da doceria para funcionamento imediato.
    """
    def __init__(self, db_connection=None):
        self.db = db_connection
        # Catálogo padrão de bolos da doceria
        self._mock_products: List[Product] = [
            Product(
                id=1,
                nome="Bolo Red Velvet Nobre",
                descricao="Massa aveludada com toque de cacau, recheio generoso de cream cheese e frutas vermelhas frescas.",
                preco=89.90,
                categoria="bolos",
                imagem_url="https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80"
            ),
            Product(
                id=2,
                nome="Bolo Trufado Belga",
                descricao="Massa de chocolate 70%, recheio cremoso de trufa belga e cobertura com raspas nobres.",
                preco=98.00,
                categoria="bolos",
                imagem_url="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80"
            ),
            Product(
                id=3,
                nome="Bolo de Cenoura com Vulcão de Brigadeiro",
                descricao="O clássico irresistível com massa fofinha e avalanche de brigadeiro gourmet 50%.",
                preco=65.00,
                categoria="bolos",
                imagem_url="https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80"
            ),
            Product(
                id=4,
                nome="Bolo Ninho com Morangos Frescos",
                descricao="Massa branca úmida, mousse suave de Leite Ninho e camadas de morangos selecionados.",
                preco=84.50,
                categoria="bolos",
                imagem_url="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80"
            ),
            Product(
                id=5,
                nome="Bolo Pistache Supremo",
                descricao="Massa artesanal infusionada com pistache puro, ganache branca e praliné crocante.",
                preco=115.00,
                categoria="bolos",
                imagem_url="https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80"
            ),
            Product(
                id=6,
                nome="Bolo de Nozes com Doce de Leite",
                descricao="Pão de ló leve, recheio de doce de leite artesanal em ponto de bico e nozes chilenas.",
                preco=92.00,
                categoria="bolos",
                imagem_url="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80"
            ),
        ]

    def find_all(self) -> List[Product]:
        """Retorna todos os bolos disponíveis do catálogo."""
        if self.db:
            # Exemplo de consulta PostgreSQL quando configurado:
            # cursor = self.db.cursor()
            # cursor.execute("SELECT id, nome, descricao, preco, categoria, imagem_url, disponivel FROM produtos WHERE disponivel = TRUE")
            pass
        return self._mock_products

    def find_by_id(self, product_id: int) -> Optional[Product]:
        """Busca um produto pelo ID para validação oficial de preço (Integridade)."""
        if self.db:
            # cursor = self.db.cursor()
            # cursor.execute("SELECT id, nome, descricao, preco FROM produtos WHERE id = %s", (product_id,))
            pass
        for prod in self._mock_products:
            if prod.id == product_id:
                return prod
        return None
