from dataclasses import dataclass
from typing import Optional

@dataclass
class Product:
    """Modelo de domínio para Bolos e Produtos."""
    id: int
    nome: str
    descricao: str
    preco: float
    categoria: str = "bolos"
    imagem_url: Optional[str] = None
    disponivel: bool = True

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "preco": round(self.preco, 2),
            "categoria": self.categoria,
            "imagem_url": self.imagem_url,
            "disponivel": self.disponivel
        }
