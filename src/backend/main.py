import os
import sys
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.backend.controllers.product_controller import product_bp
from src.backend.controllers.auth_controller import auth_bp


def create_app():
    app = Flask(__name__)

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization', 'X-Requested-With']
    )

    app.register_blueprint(product_bp)
    app.register_blueprint(auth_bp)

    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        return response, 200

    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            "status": "erro",
            "padrao_seguranca": "Confidencialidade",
            "mensagem": "Ocorreu um erro interno no servidor. Nenhuma informação confidencial foi exposta."
        }), 500

    @app.errorhandler(ValueError)
    def handle_value_error(error):
        return jsonify({
            "status": "erro",
            "padrao_seguranca": "Confidencialidade",
            "mensagem": "Dados inválidos ou produto não encontrado no catálogo oficial."
        }), 400

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        return jsonify({
            "status": "erro",
            "padrao_seguranca": "Confidencialidade",
            "mensagem": "Falha na requisição. Detalhes confidenciais do sistema foram preservados."
        }), 500

    @app.route('/api/health', methods=['GET', 'OPTIONS'])
    @app.route('/health', methods=['GET', 'OPTIONS'])
    def health_check():
        return jsonify({
            'status': 'online',
            'servico': 'Doceria de Bolos API (Flask)'
        }), 200

    return app


app = create_app()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
