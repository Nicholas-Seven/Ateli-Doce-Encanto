export interface CakeProduct {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagemUrl: string;
  pesoAproximado: string;
  porcoes: string;
  destaque?: boolean;
}

export interface CartItem {
  produto: CakeProduct;
  quantidade: number;
}

export interface UserRegistration {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
}

export interface SecurityStatus {
  limiteCaracteres: boolean;
  camposObrigatorios: boolean;
  mascarasEntrada: boolean;
  tipagemInputs: boolean;
  confidencialidade: boolean;
  integridade: boolean;
  disponibilidade: boolean;
}

export interface OrderIntegrityResult {
  sucesso: boolean;
  padraoIntegridade: {
    executadoNoServidor: boolean;
    calculoOficialBaseadoNoBanco: boolean;
    tentativaAdulteracaoFront: boolean;
    valorEnviadoPeloFront: number;
    valorRealCalculadoBackend: number;
    divergencia: number;
  };
  totalOficial: number;
  itensProcessados: {
    id: number;
    nome: string;
    quantidade: number;
    precoOficial: number;
    subtotal: number;
  }[];
  mensagem: string;
  timestamp: string;
}
