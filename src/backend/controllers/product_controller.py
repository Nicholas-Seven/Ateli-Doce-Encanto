import traceback

from flask import Blueprint, jsonify, request
from src.backend.database.connection import get_connection
from src.backend.repositories.order_repository import OrderRepository
from src.backend.repositories.product_repository import ProductRepository
from src.backend.services.order_service import OrderService

product_bp = Blueprint("products", __name__)
product_repo = ProductRepository()
order_service = OrderService(product_repo, OrderRepository())


def _find_products_table():
    for table_name in ("public.produtos", "produtos", "public.products", "products"):
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(f"SELECT 1 FROM {table_name} LIMIT 1")
            return table_name
        except Exception:
            continue
    raise RuntimeError("Tabela de produtos não encontrada em 'public.produtos', 'produtos', 'public.products' nem 'products'.")


@product_bp.route("/api/products", methods=["GET", "OPTIONS"])
@product_bp.route("/products", methods=["GET", "OPTIONS"])
def list_products():
    """Retorna o catálogo oficial de bolos em JSON válido."""
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        return response, 200

    try:
        table_name = _find_products_table()

        query = f"""
            SELECT id, nome, descricao, preco, categoria, imagem_url, disponivel
            FROM {table_name}
            WHERE disponivel = TRUE
            ORDER BY id
        """

        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()

        payload = [
            {
                "id": row[0],
                "nome": row[1],
                "descricao": row[2],
                "preco": float(row[3]),
                "categoria": row[4],
                "imagem_url": row[5],
                "disponivel": row[6],
            }
            for row in rows
        ]

        return jsonify(payload), 200

    except Exception as exc:
        print("ERRO ao buscar produtos:", exc)
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": "Erro ao buscar produtos.",
            "details": str(exc)
        }), 500


@product_bp.route("/api/produtos", methods=["GET", "OPTIONS"])
@product_bp.route("/produtos", methods=["GET", "OPTIONS"])
def list_products_legacy():
    """Compatibilidade com rotas antigas."""
    return list_products()


@product_bp.route("/api/pedidos/checkout", methods=["POST", "OPTIONS"])
@product_bp.route("/pedidos/checkout", methods=["POST", "OPTIONS"])
def checkout():
    """
    Endpoint para finalizar pedido aplicando o padrão de INTEGRIDADE.
    Recebe itens do cliente e calcula o valor real no servidor.
    """
    if request.method == "OPTIONS":
        origin = request.headers.get('Origin')
        response = jsonify({})
        response.headers['Access-Control-Allow-Origin'] = origin or '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 200

    data = request.get_json() or {}
    items = data.get("itens", [])
    client_total = data.get("total_cliente")
    user_id = data.get("usuario_id")

    if not items:
        return jsonify({"erro": "Nenhum item informado no carrinho"}), 400

    try:
        resultado = order_service.calculate_and_checkout(items, client_total, user_id)
        return jsonify(resultado), 200
    except ValueError as exc:
        return jsonify({"erro": str(exc)}), 400
