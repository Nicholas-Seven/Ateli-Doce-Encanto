import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatBRL } from '../utils/masks';
import { checkoutOrder, CheckoutResult } from '../services/api';
import { X, Trash2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<CheckoutResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const clientSubtotal = cart.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setOrderResult(null);

    try {
      const result = await checkoutOrder(cart, clientSubtotal);
      setOrderResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao processar pedido.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-xs">
      <div
        id="cart-drawer-panel"
        className="w-full max-w-lg bg-amber-50/95 backdrop-blur-md h-full flex flex-col shadow-2xl border-l border-amber-200/80 animate-in slide-in-from-right duration-300"
      >
        {/* Topo do Carrinho */}
        <div className="p-6 border-b border-amber-200/70 flex items-center justify-between bg-white/60">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Seu Pedido de Bolos
            </h2>
            <span className="text-xs text-stone-500">
              {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
          </div>
          <button
            id="btn-close-cart"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🎂</span>
              <p className="text-stone-700 font-serif font-bold text-lg">Seu pedido está vazio</p>
              <p className="text-stone-500 text-sm mt-1">
                Explore nosso catálogo e escolha seu bolo artesanal favorito.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.produto.id}
                className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-xs flex items-center gap-4"
              >
                <img
                  src={item.produto.imagemUrl}
                  alt={item.produto.nome}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-stone-900 truncate">
                    {item.produto.nome}
                  </h4>
                  <p className="text-xs text-amber-800 font-bold font-sans">
                    {formatBRL(item.produto.preco)} cada
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.produto.id, item.quantidade - 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold px-1">{item.quantidade}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.produto.id, item.quantidade + 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-stone-900 block">
                    {formatBRL(item.produto.preco * item.quantidade)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.produto.id)}
                    className="text-stone-400 hover:text-rose-600 mt-2 p-1"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {orderResult && (
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Pedido confirmado</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Seu pedido foi registrado com sucesso no banco de dados.
              </p>
              <div className="flex justify-between rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600">
                <span>Número do pedido</span>
                <strong className="text-stone-900">#{orderResult.pedido_id}</strong>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Rodapé do Carrinho com Ações */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-amber-200/70 bg-white/70 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-stone-600 font-medium">Subtotal Estimado:</span>
              <span className="text-2xl font-bold font-sans text-amber-900">
                {formatBRL(clientSubtotal)}
              </span>
            </div>

            <button
              id="btn-checkout"
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {isProcessing ? (
                <span>Finalizando pedido...</span>
              ) : (
                <>
                  <span>Finalizar pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex justify-between text-xs text-stone-500">
              <button onClick={onClearCart} className="hover:text-rose-600">
                Limpar Pedido
              </button>
              <span className="text-[11px]">Pedido processado com segurança</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
