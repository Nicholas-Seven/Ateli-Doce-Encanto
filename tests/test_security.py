from itsdangerous import URLSafeTimedSerializer
import pytest
from src.backend.main import create_app
from src.backend.config.settings import settings
from src.backend.controllers import product_controller
from src.backend.database.connection import _connection_options
from src.backend.models.product import Product

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_padrao_integridade_recalcula_precos(client, monkeypatch):
    """
    Testa o padrão de INTEGRIDADE:
    Se o cliente mandar um total adulterado (ex: R$ 1.00),
    o servidor deve recalcular o valor real com base no catálogo oficial.
    """
    payload = {
        "itens": [
            {"product_id": 1, "quantity": 2} # 2 x 89.90 = 179.80
        ],
        "total_cliente": 1.00, # Tentativa de adulteração
        "usuario_id": 999
    }
    monkeypatch.setattr(
        product_controller.product_repo,
        "find_by_id",
        lambda product_id: Product(id=1, nome="Bolo teste", descricao="", preco=89.90),
    )
    monkeypatch.setattr(product_controller.order_service.order_repo, "create", lambda *args: 123)
    token = URLSafeTimedSerializer(settings.SECRET_KEY, salt="doceria-auth-v1").dumps({"user_id": 42})
    response = client.post(
        "/api/pedidos/checkout",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["padrao_integridade"]["tentativa_adulteracao_front"] is True
    assert data["padrao_integridade"]["valor_real_calculado_backend"] == 179.80
    assert data["total_a_pagar"] == 179.80


def test_checkout_recusa_requisicao_sem_token(client):
    response = client.post(
        "/api/pedidos/checkout",
        json={"itens": [{"product_id": 1, "quantity": 1}], "usuario_id": 42},
    )

    assert response.status_code == 401


def test_conexao_neon_exige_tls():
    assert _connection_options("postgresql://app:secret@ep-example.us-east-2.aws.neon.tech/db") == {
        "sslmode": "require"
    }


def test_postgres_local_mantem_configuracao_existente():
    assert _connection_options("postgresql://postgres:postgres@localhost:5432/doceria_db") == {}

def test_padrao_confidencialidade_respostas_de_erro(client):
    """
    Testa o padrão de CONFIDENCIALIDADE:
    Mesmo em caso de falha de rota ou payload,
    não devem vazar detalhes internos, senhas ou stack traces.
    """
    response = client.post("/api/pedidos/checkout", json={"itens": [{"product_id": 9999}]})
    assert response.status_code in (400, 401, 500)
    data = response.get_json()
    # Verifica que não contém palavras de segredos de ambiente
    raw_text = response.get_data(as_text=True)
    assert "SECRET_KEY" not in raw_text
    assert "DATABASE_URL" not in raw_text


def test_checkout_preflight_sets_cors_headers(client):
    """Garante que o browser receba headers CORS corretos no preflight do checkout."""
    response = client.options(
        "/api/pedidos/checkout",
        headers={
            "Origin": "https://atelie-doce-encanto.vercel.app",
            "Access-Control-Request-Method": "POST"
        }
    )

    assert response.status_code == 200
    assert response.headers.get("Access-Control-Allow-Origin") == "https://atelie-doce-encanto.vercel.app"
    assert "POST" in response.headers.get("Access-Control-Allow-Methods", "")
    assert "Content-Type" in response.headers.get("Access-Control-Allow-Headers", "")


def test_disponibilidade_bloqueia_requisicoes_excessivas(client):
    """A disponibilidade exige bloqueio de abuso por excesso de requisições."""
    app = client.application
    app.config['TESTING'] = True

    for _ in range(5):
        response = client.get('/api/health')
        assert response.status_code == 200

    response = client.get('/api/health')
    assert response.status_code == 429
    data = response.get_json()
    assert data['padrao_seguranca'] == 'Disponibilidade'
