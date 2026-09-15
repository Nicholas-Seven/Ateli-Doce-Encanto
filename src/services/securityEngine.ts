import { CAKE_PRODUCTS } from '../data/cakeProducts';
import { CartItem, OrderIntegrityResult } from '../types';

/**
 * Motor de Simulação e Validação dos 7 Padrões de Segurança.
 * Reflete exatamente o comportamento dos Controllers e Services em Python Flask.
 */

// Armazenamento em memória para teste do padrão de Disponibilidade (Rate Limiting)
let requestTimestamps: number[] = [];
const RATE_LIMIT_MAX = 5; // Limite de 5 requisições em 10 segundos para fins de teste no front
const RATE_LIMIT_WINDOW_MS = 10000;

export interface BackendResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  padraoSeguranca?: string;
  confidencialidadePreservada?: boolean;
}

export const SecurityEngine = {
  /**
   * Padrão CID 3: DISPONIBILIDADE
   * Simula o middleware de Rate Limit do main.py
   */
  checkAvailability(): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    
    if (requestTimestamps.length >= RATE_LIMIT_MAX) {
      const oldest = requestTimestamps[0];
      const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }
    
    requestTimestamps.push(now);
    return { allowed: true, remaining: RATE_LIMIT_MAX - requestTimestamps.length };
  },

  resetRateLimit() {
    requestTimestamps = [];
  },

  /**
   * Padrão CID 2: INTEGRIDADE
   * Reflete o OrderService.calculate_and_checkout do Python.
   * O servidor calcula o valor real com base no catálogo oficial do banco de dados.
   * Nunca confia no preço total ou unitário enviado pelo Front-End.
   */
  processOrderWithIntegrity(
    cart: CartItem[],
    clientReportedTotal?: number
  ): BackendResponse<OrderIntegrityResult> {
    // 1. Checagem de disponibilidade
    const availability = this.checkAvailability();
    if (!availability.allowed) {
      return {
        status: 429,
        error: `[Padrão: Disponibilidade] Limite de requisições excedido. O servidor bloqueou sobrecarga para manter a estabilidade. Tente novamente em ${availability.retryAfter}s.`,
        padraoSeguranca: 'Disponibilidade'
      };
    }

    if (!cart.length) {
      return {
        status: 400,
        error: 'Nenhum bolo selecionado no pedido.',
        padraoSeguranca: 'Campos Obrigatórios'
      };
    }

    let officialTotal = 0;
    const processedItems = cart.map(item => {
      // Busca produto autêntico na lista oficial (como no repositório do banco)
      const officialProduct = CAKE_PRODUCTS.find(p => p.id === item.produto.id);
      if (!officialProduct) {
        throw new Error(`Produto ID ${item.produto.id} não encontrado no catálogo.`);
      }

      const itemTotal = Number((officialProduct.preco * item.quantidade).toFixed(2));
      officialTotal += itemTotal;

      return {
        id: officialProduct.id,
        nome: officialProduct.nome,
        quantidade: item.quantidade,
        precoOficial: officialProduct.preco,
        subtotal: itemTotal
      };
    });

    officialTotal = Number(officialTotal.toFixed(2));

    const reported = clientReportedTotal !== undefined ? clientReportedTotal : officialTotal;
    const divergence = Number((reported - officialTotal).toFixed(2));
    const isTampered = Math.abs(divergence) > 0.01;

    const result: OrderIntegrityResult = {
      sucesso: true,
      padraoIntegridade: {
        executadoNoServidor: true,
        calculoOficialBaseadoNoBanco: true,
        tentativaAdulteracaoFront: isTampered,
        valorEnviadoPeloFront: reported,
        valorRealCalculadoBackend: officialTotal,
        divergencia: divergence
      },
      totalOficial: officialTotal,
      itensProcessados: processedItems,
      mensagem: isTampered
        ? `⚠️ Tentativa de alteração de preço detectada no Front (R$ ${reported.toFixed(2)}). O Back-End aplicou o Padrão de Integridade e cobrou o valor autêntico oficial do catálogo: R$ ${officialTotal.toFixed(2)}.`
        : `✅ Pedido validado com sucesso pelo Servidor! Total oficial apurado com integridade: R$ ${officialTotal.toFixed(2)}.`,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };

    return {
      status: 200,
      data: result,
      padraoSeguranca: 'Integridade'
    };
  },

  /**
   * Padrão CID 1: CONFIDENCIALIDADE
   * Simula o tratamento seguro de exceções sem vazamento de segredos.
   */
  simulateConfidentialityError(): BackendResponse {
    // Simula uma exceção que ocorreria internamente (ex: tentativa de acesso ao banco com credenciais incorretas)
    // Em sistemas vulneráveis, isso retornaria: "DatabaseError: password 'postgres123' failed on postgresql://root:secr3t@10.0.0.1:5432"
    // Com o Padrão de Confidencialidade, a resposta para o cliente é higienizada:
    return {
      status: 500,
      error: 'Erro interno no processamento. Nenhuma informação sensível do sistema ou chaves foram expostas.',
      padraoSeguranca: 'Confidencialidade',
      confidencialidadePreservada: true
    };
  }
};
