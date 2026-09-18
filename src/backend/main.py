import os

from flask import Flask, jsonify
from flask_cors import CORS
from src.backend.controllers.product_controller import product_bp
from src.backend.controllers.auth_controller import auth_bp


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(product_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')

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

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'online',
            'servico': 'Doceria de Bolos API (Flask)'
        })

    return app


app = create_app()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
