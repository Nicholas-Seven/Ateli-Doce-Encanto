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

## Banco de teste e papel da aplicação

Antes de aplicar mudanças no banco publicado, use uma branch de teste do Neon e aponte apenas o backend local para a connection string dessa branch. Não compartilhe nem versione `DATABASE_URL`.

Execute `assets/schema.sql` primeiro com o papel administrativo na branch de teste. O script cria as tabelas, políticas RLS, view `usuarios_mascarados`, gatilhos e produtos iniciais. Revise o destino selecionado no Neon antes de executar: o script inclui carga de produtos e recria as políticas RLS.

Crie a credencial limitada pelo SQL Editor como administrador (não pelo botão Add role do Console, que no Neon associa papéis criados pelo Console a `neon_superuser`). Gere uma senha forte fora do chat e substitua o marcador abaixo localmente:

```sql
CREATE ROLE doceria_app
WITH LOGIN
PASSWORD 'SUBSTITUA_POR_UMA_SENHA_FORTE'
NOSUPERUSER
NOCREATEDB
NOCREATEROLE
NOBYPASSRLS
NOINHERIT
NOREPLICATION;

GRANT USAGE ON SCHEMA public TO doceria_app;
GRANT SELECT ON public.produtos TO doceria_app;

GRANT SELECT (id, nome, email, senha_hash)
ON public.usuarios TO doceria_app;
GRANT INSERT (nome, email, cpf, telefone, senha_hash)
ON public.usuarios TO doceria_app;
GRANT USAGE ON SEQUENCE public.usuarios_id_seq TO doceria_app;
GRANT SELECT ON public.usuarios_mascarados TO doceria_app;

GRANT SELECT, INSERT ON public.pedidos TO doceria_app;
GRANT USAGE ON SEQUENCE public.pedidos_id_seq TO doceria_app;
GRANT INSERT ON public.itens_pedido TO doceria_app;
GRANT USAGE ON SEQUENCE public.itens_pedido_id_seq TO doceria_app;
```

Execute o bloco somente se `doceria_app` ainda não existir. Se já existir, não repita `CREATE ROLE`: primeiro inspecione e remova privilégios não necessários antes de reutilizá-lo. A role precisa ter `rolsuper=false`, `rolbypassrls=false`, não ser proprietária das tabelas e não ter acesso de leitura às colunas originais `cpf` e `telefone`. O login consulta somente `id`, `nome`, `email` e `senha_hash`; para exibir dados pessoais, use a view mascarada.

Os gatilhos de auditoria chamam `registrar_auditoria_alteracao()` como `SECURITY DEFINER`, com `search_path` fixo e tabela de destino qualificada. Assim, a aplicação não recebe permissão direta para inserir ou alterar linhas de auditoria. Não conceda privilégios na tabela nem na sequência `auditoria_alteracoes`.

Configure a connection string desse papel apenas no ambiente do backend (local ou serviço de staging). O frontend hospedado no Vercel chama a URL pública do backend; não coloque credenciais do banco no frontend. Antes de usar o Vercel/Render em uma demonstração, confirme qual branch Git e qual `DATABASE_URL` cada serviço está usando. Não aponte produção para a branch temporária de teste.

## Demonstração do limite de requisições

O backend permite cinco requisições por IP em uma janela de 60 segundos; a sexta recebe HTTP `429` e informa o padrão de Disponibilidade. O valor local é configurado por `RATE_LIMIT_REQUESTS_PER_MINUTE=5` no `.env`. Para produção, configure a mesma variável no ambiente/ painel do serviço que hospeda o backend.

Para demonstrar localmente, reinicie o backend para começar com o contador em memória zerado e execute no PowerShell:

```powershell
1..6 | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method Get
        "Requisicao $_ : HTTP $($response.StatusCode)"
    } catch {
        "Requisicao $_ : HTTP $([int]$_.Exception.Response.StatusCode)"
    }
}
```

O resultado esperado são cinco respostas `200` e, na sexta, `429`. O contador atual é mantido em memória pelo processo do backend e reinicia quando o serviço é reiniciado; espere a janela de 60 segundos antes de repetir a demonstração sem reiniciar.

## TLS para Neon

O backend detecta hosts `*.neon.tech` em `DATABASE_URL` e passa `sslmode=require` ao driver PostgreSQL, garantindo que a conexão com o Neon use TLS mesmo que a URL recebida não declare essa opção. Conexões locais não são alteradas. Mantenha `DATABASE_URL` somente no ambiente do backend; para validação do certificado do servidor, configure `sslmode=verify-full` e o certificado raiz conforme a configuração suportada pelo seu ambiente.

## Sessões e isolamento de pedidos

Cadastro e login retornam um token assinado pelo backend, válido por uma hora. O frontend mantém o token somente em memória e o envia no cabeçalho `Authorization` ao finalizar uma compra; o ID de usuário informado no JSON não é usado. Por isso, o cliente precisa entrar na conta antes do checkout.

O script também ativa RLS em `pedidos` e `itens_pedido`. A política compara `pedidos.usuario_id` ao valor transacional `app.user_id`, definido pelo repositório do backend a partir do token validado. `FORCE ROW LEVEL SECURITY` inclui o proprietário comum da tabela na política, mas não supera papéis PostgreSQL com `BYPASSRLS` ou superusuário. Confirme que a credencial em `DATABASE_URL` não tem esses privilégios.

Defina `SECRET_KEY` como um segredo aleatório forte no ambiente do backend, especialmente em produção. Tokens assinados com a chave padrão de desenvolvimento não devem ser usados em produção. Ao aplicar RLS num banco com pedidos antigos, confira primeiro que cada pedido tem um `usuario_id` válido; pedidos sem proprietário não ficam acessíveis por estas políticas.

## Auditoria no PostgreSQL

O `assets/schema.sql` cria a tabela `auditoria_alteracoes` e gatilhos para registrar inserções, atualizações e exclusões em `usuarios`, `pedidos` e `itens_pedido`. O registro contém a tabela, o ID do registro, a operação, o usuário da conexão PostgreSQL, os nomes das colunas alteradas e o horário; não armazena os valores das colunas, evitando duplicar CPF, telefone ou outros dados pessoais no log.

Para habilitar em um banco Neon já existente, execute novamente `assets/schema.sql` no SQL Editor do Neon. Os comandos são idempotentes quanto à tabela e aos gatilhos; execuções repetidas não apagam registros de auditoria existentes.

Essa trilha registra mudanças confirmadas na mesma transação. Para resistir também a um invasor que obtenha a credencial da aplicação, use papéis PostgreSQL separados: a aplicação não deve ser dona da tabela de auditoria nem ter permissão para alterá-la ou apagá-la. O usuário que executa o script precisa ser o proprietário das tabelas para instalar os gatilhos.
