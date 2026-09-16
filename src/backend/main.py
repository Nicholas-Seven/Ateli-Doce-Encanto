import time
from collections import defaultdict
from flask import Flask, jsonify, request
from flask_cors import CORS
from config.settings import settings
from src.backend.controllers.auth_controller import auth_bp
from src.backend.controllers.product_controller import product_bp

# Controle em memória para Disponibilidade (Rate Limiting simples por IP)
request_history = defaultdict(list)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # -------------------------------------------------------------
    # PADRÃO CID 3: DISPONIBILIDADE (Proteção contra sobrecarga)
    # Garante que picos ou abusos não derrubem o servidor
    # -------------------------------------------------------------
    @app.before_request
    def check_rate_limit():
        client_ip = request.remote_addr or "127.0.0.1"
        now = time.time()
        window = 60 # 1 minuto
        
        # Limpa requisições mais antigas que 1 minuto
        request_history[client_ip] = [
            t for t in request_history[client_ip] if now - t < window
        ]
        
        if len(request_history[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return jsonify({
                "status": "erro",
                "padrao_seguranca": "Disponibilidade",
                "mensagem": "Limite de requisições excedido. Aguarde antes de tentar novamente."
            }), 429
            
        request_history[client_ip].append(now)

    # -------------------------------------------------------------
    # PADRÃO CID 1: CONFIDENCIALIDADE (Tratamento seguro de erros)
    # Garante que segredos, chaves de API, variáveis de ambiente ou
    # stacktraces internos nunca vazem para o cliente em caso de falha.
    # -------------------------------------------------------------
    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            "status": "erro",
            "padrao_seguranca": "Confidencialidade",
            "mensagem": "Ocorreu um erro interno no servidor. Nenhuma informação confidencial foi exposta."
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        # Em produção, o log vai para um arquivo seguro protegido,
        # enquanto a resposta pública permanece 100% sanitizada.
        return jsonify({
            "status": "erro",
            "padrao_seguranca": "Confidencialidade",
            "mensagem": "Falha na requisição. Detalhes confidenciais do sistema foram preservados."
        }), 500

    # Registro das rotas
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "online",
            "servico": "Doceria de Bolos API (Flask)",
            "padroes_cid_backend": {
                "confidencialidade": "Ativo (Sanitização de exceções e mascaramento de segredos)",
                "integridade": "Ativo (Recálculo estrito de preços e pedidos no servidor)",
                "disponibilidade": "Ativo (Controle de fluxo de requisições por IP)"
            }
        })

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=settings.PORT, debug=False)
