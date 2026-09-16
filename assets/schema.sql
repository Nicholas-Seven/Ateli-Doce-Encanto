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

-- Carga inicial dos bolos artesanais
INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url) VALUES
('Bolo Red Velvet Nobre', 'Massa aveludada com toque de cacau, recheio generoso de cream cheese e frutas vermelhas frescas.', 89.90, 'bolos', 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80'),
('Bolo Trufado Belga', 'Massa de chocolate 70%, recheio cremoso de trufa belga e cobertura com raspas nobres.', 98.00, 'bolos', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'),
('Bolo de Cenoura com Vulcão de Brigadeiro', 'O clássico irresistível com massa fofinha e avalanche de brigadeiro gourmet 50%.', 65.00, 'bolos', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80'),
('Bolo Ninho com Morangos Frescos', 'Massa branca úmida, mousse suave de Leite Ninho e camadas de morangos selecionados.', 84.50, 'bolos', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80'),
('Bolo Pistache Supremo', 'Massa artesanal infusionada com pistache puro, ganache branca e praliné crocante.', 115.00, 'bolos', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80'),
('Bolo de Nozes com Doce de Leite', 'Pão de ló leve, recheio de doce de leite artesanal em ponto de bico e nozes chilenas.', 92.00, 'bolos', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (nome) DO NOTHING;
