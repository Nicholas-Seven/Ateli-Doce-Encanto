import React, { useState } from 'react';
import { CAKE_PRODUCTS } from './data/cakeProducts';
import { CakeProduct, CartItem } from './types';
import { Header } from './components/Header';
import { CakeCatalog } from './components/CakeCatalog';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { SecurityStandardsModal } from './components/SecurityStandardsModal';
import { PythonArchitectureViewer } from './components/PythonArchitectureViewer';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'auth' | 'security' | 'python'>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ nome: string; email: string } | null>(null);

  // Manipulação de Carrinho
  const handleAddToCart = (product: CakeProduct, quantity: number) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.produto.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantidade = Math.min(20, updated[existingIndex].quantidade + quantity);
        return updated;
      }
      return [...prev, { produto: product, quantidade: quantity }];
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.produto.id === productId ? { ...item, quantidade: Math.min(20, quantity) } : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart(prev => prev.filter(item => item.produto.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-amber-200 selection:text-amber-900">
      
      {/* Barra de Notificação Superior com Status dos 7 Padrões */}
      <aside aria-label="Aviso de Segurança" className="bg-amber-950 text-amber-100 text-xs py-2 px-4 text-center border-b border-amber-900">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium">
            Arquitetura ativa: Python (Flask) + React + PostgreSQL | Tríade CID & 4 Padrões do Front rigorosamente validados.
          </span>
          <button
            onClick={() => setActiveTab('security')}
            className="underline text-amber-300 hover:text-white ml-1 font-semibold"
          >
            Ver Detalhes
          </button>
        </div>
      </aside>

      {/* Header Principal */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartTotalItems}
        openCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Conteúdo Principal de acordo com a aba ativa */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <CakeCatalog
            products={CAKE_PRODUCTS}
            onAddToCart={handleAddToCart}
            openSecurityPanel={() => setActiveTab('security')}
          />
        )}

        {activeTab === 'auth' && (
          <AuthModal
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab('catalog');
            }}
            onLogout={() => setCurrentUser(null)}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'security' && (
          <SecurityStandardsModal
            onNavigateToAuth={() => setActiveTab('auth')}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'python' && (
          <PythonArchitectureViewer />
        )}
      </main>

      {/* Drawer do Carrinho com Verificação de Integridade */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Rodapé da Doceria */}
      <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
            <div>
              <h4 className="text-xl font-serif font-bold text-amber-100 mb-2">
                Doceria de Bolos Artesanais
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Bolos com ingredientes selecionados, confeitaria afetiva e excelência em cada detalhe.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Conformidade de Segurança
              </h5>
              <ul className="text-xs text-stone-400 space-y-1">
                <li>• Limite de Caracteres (Buffer Overflow Protection)</li>
                <li>• Campos Obrigatórios & Validação de Estado</li>
                <li>• Máscaras de Entrada (CPF / Telefone)</li>
                <li>• Tipagem Segura de Inputs HTML5</li>
                <li>• Tríade CID: Confidencialidade, Integridade e Disponibilidade</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Backend & Banco de Dados
              </h5>
              <p className="text-xs text-stone-400 leading-relaxed mb-2">
                Backend modular em Python Flask (localizado em <code>/sistema</code>) pronto para ser conectado ao PostgreSQL.
              </p>
              <button
                onClick={() => setActiveTab('python')}
                className="text-xs text-amber-300 hover:text-amber-200 font-semibold underline"
              >
                Abrir explorador de código da arquitetura
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>© {new Date().getFullYear()} Doceria de Bolos. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Feito com <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> e segurança de dados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
