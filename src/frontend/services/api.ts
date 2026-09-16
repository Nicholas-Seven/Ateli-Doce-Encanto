import { CakeProduct } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiProduct {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem_url: string | null;
  disponivel: boolean;
}

export async function fetchProducts(): Promise<CakeProduct[]> {
  const response = await fetch(`${API_URL}/produtos`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar o catálogo.');
  }

  const products: ApiProduct[] = await response.json();

  return products.map(product => ({
    id: product.id,
    nome: product.nome,
    descricao: product.descricao,
    preco: product.preco,
    categoria: product.categoria,
    imagemUrl: product.imagem_url || '',
    pesoAproximado: '',
    porcoes: ''
  }));
}
