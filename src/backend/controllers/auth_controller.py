from flask import Blueprint, jsonify, request
from src.backend.repositories.user_repository import UserRepository
from src.backend.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
user_repo = UserRepository()
auth_service = AuthService(user_repo)

@auth_bp.route("/auth/cadastro", methods=["POST"])
def register():
    data = request.get_json() or {}
    try:
        user = auth_service.register(
            nome=data.get("nome", ""),
            email=data.get("email", ""),
            cpf=data.get("cpf", ""),
            telefone=data.get("telefone", ""),
            senha=data.get("senha", "")
        )
        return jsonify({
            "mensagem": "Cadastro realizado com sucesso!",
            "usuario": {
                "id": user.id,
                "nome": user.nome,
                "email": user.email,
                "cpf": user.cpf,
                "telefone": user.telefone
            }
        }), 201
    except ValueError as e:
        return jsonify({"erro": str(e)}), 400

@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    try:
        user = auth_service.login(
            email=data.get("email", ""),
            senha=data.get("senha", "")
        )
        return jsonify({
            "mensagem": "Login efetuado com sucesso!",
            "usuario": {
                "id": user.id,
                "nome": user.nome,
                "email": user.email
            }
        }), 200
    except ValueError as e:
        return jsonify({"erro": str(e)}), 401
