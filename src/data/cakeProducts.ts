import { CakeProduct } from '../types';

export const CAKE_PRODUCTS: CakeProduct[] = [
  {
    id: 1,
    nome: 'Bolo Red Velvet Nobre',
    descricao: 'Massa aveludada com cacau premium, recheio generoso de cream cheese frosting e coulis de frutas vermelhas.',
    preco: 89.90,
    categoria: 'Bolos Especiais',
    imagemUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80',
    pesoAproximado: '1.5 kg',
    porcoes: '12 a 15 fatias',
    destaque: true
  },
  {
    id: 2,
    nome: 'Bolo Trufado de Chocolate Belga',
    descricao: 'Pão de ló de chocolate 70% Callebaut, camadas de trufa cremosa e cobertura com raspas artesanais.',
    preco: 98.00,
    categoria: 'Chocolates Nobres',
    imagemUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    pesoAproximado: '1.8 kg',
    porcoes: '16 a 18 fatias',
    destaque: true
  },
  {
    id: 3,
    nome: 'Bolo de Cenoura com Vulcão de Brigadeiro',
    descricao: 'Receita caseira com cenouras frescas, textura fofa e erupção central de brigadeiro gourmet 50% cacau.',
    preco: 65.00,
    categoria: 'Bolos Vulcão',
    imagemUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80',
    pesoAproximado: '1.2 kg',
    porcoes: '10 a 12 fatias'
  },
  {
    id: 4,
    nome: 'Bolo Ninho com Morangos Frescos',
    descricao: 'Massa chiffon leve e aerada, mousse suave de Leite Ninho e farta seleção de morangos higienizados.',
    preco: 84.50,
    categoria: 'Frutas & Cremes',
    imagemUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
    pesoAproximado: '1.6 kg',
    porcoes: '14 a 16 fatias',
    destaque: true
  },
  {
    id: 5,
    nome: 'Bolo Pistache Supremo',
    descricao: 'Pão de ló verde infusionado com pasta de pistache de Bronte, ganache de chocolate branco e praliné crocante.',
    preco: 115.00,
    categoria: 'Bolos Especiais',
    imagemUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
    pesoAproximado: '1.4 kg',
    porcoes: '12 a 14 fatias'
  },
  {
    id: 6,
    nome: 'Bolo de Nozes com Doce de Leite',
    descricao: 'Bolo amanteigado com pedaços de nozes chilenas e recheio de doce de leite artesanal em ponto de corte.',
    preco: 92.00,
    categoria: 'Clássicos da Vovó',
    imagemUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
    pesoAproximado: '1.5 kg',
    porcoes: '12 a 15 fatias'
  }
];
