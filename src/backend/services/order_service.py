from typing import List, Dict, Any
from src.backend.repositories.product_repository import ProductRepository

class OrderService:
    """
    Serviço de Pedidos da Doceria.
    
    Implementação do Padrão de Segurança no Back-End:
    🛡️ INTEGRIDADE:
    O servidor NUNCA confia no preço unitário ou no valor total enviado pelo Front-End.
    Ele consulta o catálogo oficial no banco de dados (repositório), busca o valor real
    cadastrado de cada bolo, multiplica pela quantidade e calcula o total autêntico.
    """
    def __init__(self, product_repository: ProductRepository):
        self.product_repo = product_repository

    def calculate_and_checkout(self, items: List[Dict[str, Any]], client_reported_total: float = None) -> Dict[str, Any]:
        """
        Calcula o total oficial no servidor e detecta eventuais divergências/adulterações no Front-End.
        """
        official_items = []
        official_total = 0.0

        for item in items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            
            # Busca o produto autêntico no banco de dados
            product = self.product_repo.find_by_id(product_id)
            if not product:
                raise ValueError(f"Produto de ID {product_id} não encontrado no catálogo oficial.")
            
            item_total = round(product.preco * quantity, 2)
            official_total += item_total
            
            official_items.append({
                "product_id": product.id,
                "nome": product.nome,
                "preco_oficial": product.preco,
                "quantidade": quantity,
                "subtotal": item_total
            })

        official_total = round(official_total, 2)

        # Checagem do Padrão de Integridade
        tampering_detected = False
        divergence_amount = 0.0
        if client_reported_total is not None:
            divergence_amount = round(client_reported_total - official_total, 2)
            if abs(divergence_amount) > 0.01:
                tampering_detected = True

        return {
            "status": "sucesso",
            "padrao_integridade": {
                "executado_no_servidor": True,
                "calculo_oficial_baseado_no_banco": True,
                "tentativa_adulteracao_front": tampering_detected,
                "valor_enviado_pelo_front": client_reported_total,
                "valor_real_calculado_backend": official_total,
                "divergencia": divergence_amount
            },
            "itens_processados": official_items,
            "total_a_pagar": official_total
        }
