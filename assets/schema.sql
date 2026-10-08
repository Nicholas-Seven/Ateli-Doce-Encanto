-- Script DDL para criação do Banco de Dados PostgreSQL da Doceria
-- Execute este script quando for configurar o seu PostgreSQL

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW public.usuarios_mascarados AS
SELECT
    id,
    CASE
        WHEN NULLIF(regexp_replace(COALESCE(cpf, ''), '[^0-9]', '', 'g'), '') IS NULL THEN NULL
        ELSE '***.***.***-' ||
             RIGHT(regexp_replace(cpf, '[^0-9]', '', 'g'), 2)
    END AS cpf_mascarado,
    CASE
        WHEN NULLIF(regexp_replace(COALESCE(telefone, ''), '[^0-9]', '', 'g'), '') IS NULL THEN NULL
        ELSE '(**) *****-' ||
             RIGHT(regexp_replace(telefone, '[^0-9]', '', 'g'), 4)
    END AS telefone_mascarado
FROM public.usuarios;

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
);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id),
    produto_id INT REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL -- Preço capturado no momento do pedido via banco
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pedidos_do_usuario_autenticado ON pedidos;
CREATE POLICY pedidos_do_usuario_autenticado ON pedidos
FOR ALL
USING (usuario_id = NULLIF(current_setting('app.user_id', true), '')::INTEGER)
WITH CHECK (usuario_id = NULLIF(current_setting('app.user_id', true), '')::INTEGER);

ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS itens_dos_pedidos_do_usuario ON itens_pedido;
CREATE POLICY itens_dos_pedidos_do_usuario ON itens_pedido
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM pedidos
        WHERE pedidos.id = itens_pedido.pedido_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM pedidos
        WHERE pedidos.id = itens_pedido.pedido_id
    )
);

CREATE TABLE IF NOT EXISTS auditoria_alteracoes (
    id BIGSERIAL PRIMARY KEY,
    tabela TEXT NOT NULL,
    registro_id TEXT,
    operacao TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_banco TEXT NOT NULL DEFAULT session_user,
    colunas_alteradas TEXT[] NOT NULL DEFAULT '{}',
    ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION registrar_auditoria_alteracao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    registro_antigo JSONB;
    registro_novo JSONB;
    id_registro TEXT;
    colunas TEXT[];
BEGIN
    IF TG_OP <> 'INSERT' THEN
        registro_antigo := to_jsonb(OLD);
    END IF;

    IF TG_OP <> 'DELETE' THEN
        registro_novo := to_jsonb(NEW);
    END IF;

    id_registro := COALESCE(registro_novo ->> 'id', registro_antigo ->> 'id');

    SELECT COALESCE(array_agg(coluna ORDER BY coluna), '{}')
    INTO colunas
    FROM (
        SELECT jsonb_object_keys(COALESCE(registro_antigo, '{}'::jsonb)) AS coluna
        UNION
        SELECT jsonb_object_keys(COALESCE(registro_novo, '{}'::jsonb)) AS coluna
    ) AS nomes_colunas
    WHERE registro_antigo -> coluna IS DISTINCT FROM registro_novo -> coluna;

    INSERT INTO public.auditoria_alteracoes (tabela, registro_id, operacao, colunas_alteradas)
    VALUES (TG_TABLE_NAME, id_registro, TG_OP, colunas);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_auditoria_alteracao() FROM PUBLIC;

DROP TRIGGER IF EXISTS auditoria_usuarios ON usuarios;
CREATE TRIGGER auditoria_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria_alteracao();

DROP TRIGGER IF EXISTS auditoria_pedidos ON pedidos;
CREATE TRIGGER auditoria_pedidos
AFTER INSERT OR UPDATE OR DELETE ON pedidos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria_alteracao();

DROP TRIGGER IF EXISTS auditoria_itens_pedido ON itens_pedido;
CREATE TRIGGER auditoria_itens_pedido
AFTER INSERT OR UPDATE OR DELETE ON itens_pedido
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria_alteracao();

-- Carga inicial dos bolos artesanais
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url)
SELECT dados.nome, dados.descricao, dados.preco, dados.categoria, dados.imagem_url
FROM (VALUES
    ('Bolo Red Velvet Nobre', 'Massa aveludada com toque de cacau, recheio generoso de cream cheese e frutas vermelhas frescas.', 89.90, 'bolos', 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80'),
    ('Bolo Trufado Belga', 'Massa de chocolate 70%, recheio cremoso de trufa belga e cobertura com raspas nobres.', 98.00, 'bolos', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'),
    ('Bolo de Cenoura com Vulcão de Brigadeiro', 'O clássico irresistível com massa fofinha e avalanche de brigadeiro gourmet 50%.', 65.00, 'bolos', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80'),
    ('Bolo Ninho com Morangos Frescos', 'Massa branca úmida, mousse suave de Leite Ninho e camadas de morangos selecionados.', 84.50, 'bolos', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80'),
    ('Bolo Pistache Supremo', 'Massa artesanal infusionada com pistache puro, ganache branca e praliné crocante.', 115.00, 'bolos', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80'),
    ('Bolo de Nozes com Doce de Leite', 'Pão de ló leve, recheio de doce de leite artesanal em ponto de bico e nozes chilenas.', 92.00, 'bolos', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80')
) AS dados(nome, descricao, preco, categoria, imagem_url)
WHERE NOT EXISTS (
    SELECT 1
    FROM produtos existente
    WHERE existente.nome = dados.nome
);
