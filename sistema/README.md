# 🍰 Doceria de Bolos - Arquitetura Profissional (Python Flask + PostgreSQL + React)

Este projeto foi concebido seguindo a arquitetura em camadas (Controllers, Services, Models, Repositories) e implementando estritamente os **7 Padrões de Segurança** (4 no Front-End e 3 no Back-End via Tríade CID).

---

## 📁 Estrutura de Pastas do Backend (`sistema/`)

```text
sistema/
├── src/
│   ├── controllers/      # auth_controller.py, product_controller.py
│   ├── services/         # auth_service.py, order_service.py
│   ├── models/           # user.py, product.py
│   ├── repositories/     # user_repository.py, product_repository.py
│   └── main.py           # Ponto de entrada Flask
├── tests/                # test_security.py (Validações dos padrões)
├── docs/                 # api_spec.md
├── config/               # settings.py
├── assets/               # schema.sql (DDL para o PostgreSQL)
├── .env                  # Configuração de variáveis e secrets
├── .gitignore
├── README.md
└── requirements.txt      # Dependências Python
```

---

## 🛡️ Os 7 Padrões de Segurança Implementados

### Front-End (React):
1. **Limite de Caracteres (`maxLength`):** Previne buffer overflow e envio excessivo de dados.
2. **Campos Obrigatórios (`required`):** Garante consistência antes do processamento.
3. **Máscaras de Entrada:** Padronização com restrição de caracteres especiais (CPF e Telefone).
4. **Tipagem de Inputs:** Validação nativa com `<input type="email">`, `type="number"`, `type="password"`.

### Back-End (Tríade CID em Flask):
5. **Confidencialidade:** Respostas de erro sanitizadas sem vazamento de stacktrace ou credenciais do sistema.
6. **Integridade:** Cálculo do valor total realizado exclusivamente no servidor com base no banco de dados.
7. **Disponibilidade:** Limite de taxa de requisições (Rate Limit) prevenindo sobrecarga do servidor.

---

## 🗄️ Configuração do PostgreSQL (Para quando você for configurar seu banco)

Como solicitado, o banco de dados não foi criado por conta própria. Quando você for configurá-lo:
1. Crie seu banco no PostgreSQL:
   ```sql
   CREATE DATABASE doceria_db;
   ```
2. Execute o script de criação das tabelas e carga inicial de bolos contido em `sistema/assets/schema.sql`.
3. Ajuste a URL no arquivo `sistema/.env`:
   ```env
   DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/doceria_db
   ```
4. Instale as dependências e inicie o servidor Python:
   ```bash
   pip install -r requirements.txt
   python src/main.py
   ```
