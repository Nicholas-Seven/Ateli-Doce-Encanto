# Ateliê Doce Encanto: arquitetura do projeto

O projeto reúne o front-end React e o back-end Flask em um único `src`, mantendo cada camada organizada em seu próprio módulo.

## Estrutura

```text
src/
├── frontend/
│   ├── components/
│   ├── data/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
└── backend/
    ├── controllers/
    ├── services/
    ├── models/
    ├── repositories/
    └── main.py
config/settings.py
assets/schema.sql
docs/
tests/
requirements.txt
```

## Executar o front-end

Na raiz do projeto:

```bash
npm install
npm run dev
```

## Executar o back-end

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m src.backend.main
```

O banco PostgreSQL continua sendo configurado separadamente usando `assets/schema.sql` e a variável `DATABASE_URL` do `.env`.
