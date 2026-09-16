import React from 'react';
import { Cake, ShoppingBag, User } from 'lucide-react';

interface HeaderProps {
  activeTab: 'catalog' | 'auth';
  setActiveTab: (tab: 'catalog' | 'auth') => void;
  cartCount: number;
  openCart: () => void;
  currentUser: { nome: string; email: string } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  currentUser,
  onLogout
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Marca da Doceria */}
          <button
            id="btn-logo-home"
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Cake className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold text-stone-900 tracking-tight block leading-tight">
                Ateliê Doce Encanto
              </span>
              <span className="text-xs font-sans text-amber-800 font-medium tracking-wide block">
                Confeitaria Artesanal
              </span>
            </div>
          </button>

          {/* Navegação Principal */}
          <nav className="hidden md:flex items-center gap-1 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-200/50">
            <button
              id="nav-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'catalog'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-amber-200/50'
              }`}
            >
              Catálogo de Bolos
            </button>

            <button
              id="nav-auth"
              onClick={() => setActiveTab('auth')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'auth'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-amber-200/50'
              }`}
            >
              {currentUser ? `Minha Conta (${currentUser.nome.split(' ')[0]})` : 'Login & Cadastro'}
            </button>

          </nav>

          {/* Ações Direitas: Usuário & Carrinho */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-stone-700 bg-amber-100/80 px-3 py-1.5 rounded-full border border-amber-300/60">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span>{currentUser.nome.split(' ')[0]}</span>
                <button
                  onClick={onLogout}
                  className="text-stone-500 hover:text-rose-600 font-bold ml-1"
                  title="Sair"
                >
                  (sair)
                </button>
              </div>
            )}

            {/* Botão de Carrinho */}
            <button
              id="btn-open-cart"
              onClick={openCart}
              className="relative flex items-center justify-center p-3 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md hover:shadow-lg focus:outline-hidden"
              aria-label="Abrir Carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  id="badge-cart-count"
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs border-2 border-amber-50"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-amber-200/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-2 py-1 rounded-lg ${activeTab === 'catalog' ? 'text-amber-800 font-bold bg-amber-200/60' : 'text-stone-600'}`}
          >
            Bolos
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-2 py-1 rounded-lg ${activeTab === 'auth' ? 'text-amber-800 font-bold bg-amber-200/60' : 'text-stone-600'}`}
          >
            {currentUser ? 'Perfil' : 'Conta'}
          </button>
        </div>
      </div>
    </header>
  );
};
