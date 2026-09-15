from flask import Blueprint, jsonify, request
from src.repositories.product_repository import ProductRepository
from src.services.order_service import OrderService

product_bp = Blueprint("products", __name__)
product_repo = ProductRepository()
order_service = OrderService(product_repo)

@product_bp.route("/api/produtos", methods=["GET"])
def list_products():
    """Retorna o catálogo oficial de bolos."""
    products = product_repo.find_all()
    return jsonify([p.to_dict() for p in products]), 200

@product_bp.route("/api/pedidos/checkout", methods=["POST"])
def checkout():
    """
    Endpoint para finalizar pedido aplicando o padrão de INTEGRIDADE.
    Recebe itens do cliente e calcula o valor real no servidor.
    """
    data = request.get_json() or {}
    items = data.get("itens", [])
    client_total = data.get("total_cliente")

    if not items:
        return jsonify({"erro": "Nenhum item informado no carrinho"}), 400

    resultado = order_service.calculate_and_checkout(items, client_total)
    return jsonify(resultado), 200
