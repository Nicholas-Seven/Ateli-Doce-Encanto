# Ateliê Doce Encanto

Aplicação de confeitaria artesanal com front-end React/Vite e back-end Python/Flask.

## Arquitetura

```text
src/
├── frontend/    # React, componentes, catálogo e carrinho
└── backend/     # Flask, controllers, services, models e repositories
```

As configurações compartilhadas ficam em `config/`, o schema do banco em `assets/`, os testes em `tests/` e a documentação em `docs/`.

## Front-end

```bash
npm install
npm run dev
```

## Back-end

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m src.backend.main
```

O back-end usa a variável `DATABASE_URL` definida no `.env` para a futura integração com PostgreSQL.
