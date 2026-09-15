import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Server, Smartphone, Play, RefreshCw, AlertCircle } from 'lucide-react';
import { SecurityEngine, BackendResponse } from '../services/securityEngine';

interface SecurityStandardsModalProps {
  onNavigateToAuth: () => void;
  onNavigateToCatalog: () => void;
}

export const SecurityStandardsModal: React.FC<SecurityStandardsModalProps> = ({
  onNavigateToAuth,
  onNavigateToCatalog
}) => {
  // Estados para testes interativos
  const [rateLimitCounter, setRateLimitCounter] = useState(0);
  const [rateLimitFeedback, setRateLimitFeedback] = useState<string | null>(null);
  
  const [confidentialityFeedback, setConfidentialityFeedback] = useState<{
    status: number;
    resposta: string;
    segredosProtegidos: string[];
  } | null>(null);

  // Teste de Disponibilidade (Rate Limit)
  const handleTestAvailability = () => {
    const result = SecurityEngine.checkAvailability();
    setRateLimitCounter(prev => prev + 1);

    if (result.allowed) {
      setRateLimitFeedback(
        `✅ Requisição #${rateLimitCounter + 1} permitida. Requisições restantes na janela: ${result.remaining}. O servidor opera em disponibilidade normal.`
      );
    } else {
      setRateLimitFeedback(
        `⛔ [Padrão: Disponibilidade Ativado] Limite de rajada atingido! O servidor aplicou throttling HTTP 429 para evitar sobrecarga de processamento pesado. Libera em ${result.retryAfter}s.`
      );
    }
  };

  const handleResetAvailability = () => {
    SecurityEngine.resetRateLimit();
    setRateLimitCounter(0);
    setRateLimitFeedback('Contador de requisições reiniciado.');
  };

  // Teste de Confidencialidade (Sanitização de erro)
  const handleTestConfidentiality = () => {
    const response: BackendResponse = SecurityEngine.simulateConfidentialityError();
    setConfidentialityFeedback({
      status: response.status,
      resposta: response.error || '',
      segredosProtegidos: [
        'DATABASE_URL (postgresql://postgres:***@localhost:5432)',
        'SECRET_KEY (chave_secreta_jwt)',
        'Caminhos físicos do servidor (/app/sistema/src/...)',
        'Stacktrace interno do Python/Flask'
      ]
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Conformidade com os 7 Padrões de Segurança
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-3">
          Painel de Auditoria & Segurança
        </h1>
        <p className="text-stone-600 text-base leading-relaxed">
          Este projeto foi construído respeitando estritamente os 4 padrões no Front-End e os 3 pilares da Tríade CID no Back-End.
        </p>
      </div>

      {/* Grid: 4 Padrões do Front + 3 do Back */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* COLUNA 1: SEGURANÇA NO FRONT-END */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  Segurança no Front-End
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  4 Padrões Implementados em React
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Padrão 1 */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    1. Limite de Caracteres
                  </span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-stone-600">
                    maxLength
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Objetivo:</strong> Previne ataques de Buffer Overflow (no nível de aplicação) e envios desnecessários de grandes volumes de dados.
                </p>
                <div className="mt-2 text-[11px] text-amber-800 bg-white/80 p-2 rounded-lg border border-amber-100">
                  Aplicado em: Nome (100 carac.), E-mail (120), Senha (60) e Qtd no Catálogo.
                </div>
              </div>

              {/* Padrão 2 */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    2. Campos Obrigatórios
                  </span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-stone-600">
                    required
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Objetivo:</strong> Garante que o estado da aplicação seja consistente antes do processamento.
                </p>
                <div className="mt-2 text-[11px] text-amber-800 bg-white/80 p-2 rounded-lg border border-amber-100">
                  Aplicado em: Todos os campos do cadastro e login com validação antes do envio.
                </div>
              </div>

              {/* Padrão 3 */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    3. Máscaras de Entrada (CPF e Telefone)
                  </span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-stone-600">
                    regex / sanitização
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Objetivo:</strong> Garante a padronização e evita a inserção de caracteres especiais onde não deveriam existir.
                </p>
                <div className="mt-2 text-[11px] text-amber-800 bg-white/80 p-2 rounded-lg border border-amber-100 font-mono">
                  CPF: 000.000.000-00 | Tel: (00) 00000-0000
                </div>
              </div>

              {/* Padrão 4 */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    4. Tipagem de Inputs
                  </span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-stone-600">
                    type="..."
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Objetivo:</strong> Usar <code>&lt;input type="email"&gt;</code> ou <code>type="number"</code> ajuda o navegador a validar o formato antes mesmo do clique no "Enviar".
                </p>
                <div className="mt-2 text-[11px] text-amber-800 bg-white/80 p-2 rounded-lg border border-amber-100">
                  Tipos empregados: email, number, password, tel, text.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToAuth}
            className="w-full mt-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm transition-all shadow-xs"
          >
            Testar Formulário de Login & Cadastro
          </button>
        </div>

        {/* COLUNA 2: A TRÍADE CID NO BACK-END */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  A Tríade CID no Back-End
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  3 Padrões Implementados em Python Flask
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Padrão 5: Confidencialidade */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-700" />
                    5. Confidencialidade
                  </span>
                  <button
                    onClick={handleTestConfidentiality}
                    className="text-[11px] bg-stone-800 hover:bg-stone-900 text-amber-300 font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Simular Erro
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Definição:</strong> Garantir que o código do Back-End não vaze chaves de API ou segredos do sistema em respostas de erro.
                </p>
                {confidentialityFeedback && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-stone-300 text-xs space-y-1.5">
                    <span className="font-bold text-emerald-800 block">
                      ✓ Resposta HTTP {confidentialityFeedback.status} Sanitizada:
                    </span>
                    <p className="text-stone-700 font-mono text-[11px]">
                      "{confidentialityFeedback.resposta}"
                    </p>
                    <span className="text-[10px] text-stone-500 block pt-1 border-t border-stone-100">
                      Informações protegidas contra vazamento:
                    </span>
                    <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">
                      {confidentialityFeedback.segredosProtegidos.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Padrão 6: Integridade */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    6. Integridade
                  </span>
                  <button
                    onClick={onNavigateToCatalog}
                    className="text-[11px] bg-amber-700 hover:bg-amber-800 text-white font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Testar no Pedido
                  </button>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Definição:</strong> Validar os cálculos no servidor (Ex: nunca confiar no preço total enviado pelo Front-End; o Back-End deve calcular o valor real com base no banco de dados).
                </p>
                <div className="mt-2 text-[11px] text-stone-700 bg-white p-2 rounded-lg border border-stone-200">
                  Implementado em: <code>sistema/src/services/order_service.py</code>
                </div>
              </div>

              {/* Padrão 7: Disponibilidade */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-700" />
                    7. Disponibilidade
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleTestAvailability}
                      className="text-[11px] bg-blue-700 hover:bg-blue-800 text-white font-medium px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Disparar Requisição
                    </button>
                    <button
                      onClick={handleResetAvailability}
                      className="text-[11px] bg-stone-200 text-stone-700 px-1.5 py-1 rounded-lg"
                      title="Resetar"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Definição:</strong> Implementar balanceamento de carga / rate limiting para que o processamento pesado não derrube o servidor.
                </p>
                {rateLimitFeedback && (
                  <div className="mt-3 p-2.5 bg-white rounded-xl border border-stone-300 text-xs text-stone-800">
                    {rateLimitFeedback}
                  </div>
                )}
                <div className="mt-2 text-[11px] text-stone-700 bg-white p-2 rounded-lg border border-stone-200">
                  Implementado em: <code>sistema/src/main.py</code> (Middleware de Rate Limit)
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Regra estrita cumprida: Apenas estes 7 padrões estão implementados no projeto.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
