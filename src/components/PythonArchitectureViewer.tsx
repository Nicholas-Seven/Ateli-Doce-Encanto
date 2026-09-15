import React, { useState } from 'react';
import { FolderTree, FileCode, Database, Terminal, Copy, Check } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  category: 'controller' | 'service' | 'model' | 'repository' | 'config' | 'sql' | 'test';
  content: string;
}

const SYSTEM_FILES: FileItem[] = [
  {
    name: 'order_service.py (Padrão Integridade)',
    path: 'sistema/src/services/order_service.py',
    category: 'service',
    content: `from typing import List, Dict, Any
from src.repositories.product_repository import ProductRepository

class OrderService:
    """
    Serviço de Pedidos da Doceria.
    
    🛡️ INTEGRIDADE (Tríade CID):
    O servidor NUNCA confia no preço unitário ou no valor total enviado pelo Front-End.
    Ele consulta o catálogo oficial no banco de dados (repositório), busca o valor real
    cadastrado de cada bolo, multiplica pela quantidade e calcula o total autêntico.
    """
    def __init__(self, product_repository: ProductRepository):
        self.product_repo = product_repository

    def calculate_and_checkout(self, items: List[Dict[str, Any]], client_reported_total: float = None) -> Dict[str, Any]:
        official_items = []
        official_total = 0.0

        for item in items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            
            # Consulta oficial no banco de dados
            product = self.product_repo.find_by_id(product_id)
            if not product:
                raise ValueError(f"Produto ID {product_id} inexistente.")
            
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
        tampering_detected = False
        if client_reported_total is not None and abs(client_reported_total - official_total) > 0.01:
            tampering_detected = True

        return {
            "status": "sucesso",
            "padrao_integridade": {
                "executado_no_servidor": True,
                "calculo_oficial_baseado_no_banco": True,
                "tentativa_adulteracao_front": tampering_detected,
                "valor_enviado_pelo_front": client_reported_total,
                "valor_real_calculado_backend": official_total
            },
            "itens": official_items,
            "total_oficial": official_total
        }`
  },
  {
    name: 'main.py (Confidencialidade & Disponibilidade)',
    path: 'sistema/src/main.py',
    category: 'controller',
    content: `from collections import defaultdict
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from config.settings import settings
from src.controllers.auth_controller import auth_bp
from src.controllers.product_controller import product_bp

request_history = defaultdict(list)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # PADRÃO CID: DISPONIBILIDADE (Rate Limiting)
    @app.before_request
    def check_rate_limit():
        client_ip = request.remote_addr or "127.0.0.1"
        now = time.time()
        request_history[client_ip] = [t for t in request_history[client_ip] if now - t < 60]
        if len(request_history[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            return jsonify({
                "status": "erro",
                "padrao": "Disponibilidade",
                "mensagem": "Limite de requisições excedido. Aguarde antes de tentar novamente."
            }), 429
        request_history[client_ip].append(now)

    # PADRÃO CID: CONFIDENCIALIDADE (Sanitização de Exceções)
    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({
            "status": "erro",
            "padrao": "Confidencialidade",
            "mensagem": "Ocorreu um erro interno. Nenhuma informação confidencial ou chave foi exposta."
        }), 500

    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=settings.PORT)`
  },
  {
    name: 'schema.sql (PostgreSQL DDL)',
    path: 'sistema/assets/schema.sql',
    category: 'sql',
    content: `-- Script DDL PostgreSQL para a Doceria
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'bolos',
    imagem_url VARCHAR(255),
    disponivel BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    total NUMERIC(10, 2) NOT NULL, -- Calculado com integridade no Backend
    status VARCHAR(50) DEFAULT 'confirmado',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    name: 'product_repository.py (PostgreSQL Repo)',
    path: 'sistema/src/repositories/product_repository.py',
    category: 'repository',
    content: `from typing import List, Optional
from src.models.product import Product

class ProductRepository:
    """
    Repositório de Produtos.
    Pronto para receber a conexão do seu PostgreSQL quando configurado.
    """
    def __init__(self, db_connection=None):
        self.db = db_connection

    def find_all(self) -> List[Product]:
        if self.db:
            # cursor = self.db.cursor()
            # cursor.execute("SELECT id, nome, descricao, preco FROM produtos WHERE disponivel = TRUE")
            pass
        return [...]

    def find_by_id(self, product_id: int) -> Optional[Product]:
        # Consulta oficial do preço no banco para garantia de integridade
        if self.db:
            # cursor = self.db.cursor()
            # cursor.execute("SELECT id, nome, descricao, preco FROM produtos WHERE id = %s", (product_id,))
            pass
        return ...`
  },
  {
    name: 'test_security.py (Testes Automatizados)',
    path: 'sistema/tests/test_security.py',
    category: 'test',
    content: `def test_padrao_integridade_recalcula_precos(client):
    payload = {
        "itens": [{"product_id": 1, "quantity": 2}],
        "total_cliente": 1.00 # Tentativa de adulteração
    }
    response = client.post("/api/pedidos/checkout", json=payload)
    data = response.get_json()
    assert data["padrao_integridade"]["tentativa_adulteracao_front"] is True
    assert data["padrao_integridade"]["valor_real_calculado_backend"] == 179.80`
  }
];

export const PythonArchitectureViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileItem>(SYSTEM_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <FolderTree className="w-3.5 h-3.5 text-amber-800" />
            Estrutura da Imagem 3 Concluída
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Arquitetura Profissional Python Flask & PostgreSQL
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Arquivos gerados em <code>/sistema</code> respeitando a divisão de Controllers, Services, Models e Repositories.
          </p>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-amber-200/80 text-xs text-stone-600 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 shrink-0" />
          <span>PostgreSQL: Script DDL pronto em <code>sistema/assets/schema.sql</code></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de Arquivos */}
        <div className="bg-white rounded-3xl p-4 border border-amber-200/70 shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 px-3 uppercase tracking-wider block mb-2">
            Arquivos do Backend
          </span>
          {SYSTEM_FILES.map(file => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 ${
                selectedFile.path === file.path
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-amber-50 hover:text-stone-900'
              }`}
            >
              <FileCode className="w-4 h-4 shrink-0" />
              <span className="truncate">{file.name}</span>
            </button>
          ))}

          <div className="pt-4 border-t border-stone-100 px-2 text-[11px] text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">Comandos para iniciar:</p>
            <div className="bg-stone-900 text-amber-300 p-2 rounded-lg font-mono text-[10px] space-y-1">
              <div>pip install -r requirements.txt</div>
              <div>python src/main.py</div>
            </div>
          </div>
        </div>

        {/* Visualizador de Código */}
        <div className="lg:col-span-3 bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-800 text-stone-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs text-amber-300 font-semibold">
                  {selectedFile.path}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <pre className="font-mono text-xs leading-relaxed text-amber-100/90 overflow-x-auto p-2 max-h-[480px]">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-800 text-stone-400 text-xs flex items-center justify-between">
            <span>🍰 Arquitetura pronta para integração com PostgreSQL</span>
            <span className="font-mono text-[11px] text-amber-400">Python 3.10+ / Flask 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
