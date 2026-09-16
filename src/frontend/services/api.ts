import { CakeProduct } from '../types';
import { CartItem } from '../types';

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

export interface CheckoutResult {
  pedido_id: number;
  total_a_pagar: number;
  itens_processados: {
    product_id: number;
    nome: string;
    quantidade: number;
    preco_oficial: number;
    subtotal: number;
  }[];
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

export async function checkoutOrder(cart: CartItem[], clientTotal: number): Promise<CheckoutResult> {
  const response = await fetch(`${API_URL}/pedidos/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itens: cart.map(item => ({
        product_id: item.produto.id,
        quantity: item.quantidade
      })),
      total_cliente: clientTotal
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || 'Não foi possível finalizar o pedido.');
  }

  return data;
}
