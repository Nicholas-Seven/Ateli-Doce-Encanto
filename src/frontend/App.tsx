import React, { useEffect, useState } from 'react';
import { CakeProduct, CartItem } from './types';
import { fetchProducts } from './services/api';
import { Header } from './components/Header';
import { CakeCatalog } from './components/CakeCatalog';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'auth'>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<CakeProduct[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ nome: string; email: string } | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(error => setCatalogError(error.message));
  }, []);

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
          <>
            <CakeCatalog
              products={products}
              onAddToCart={handleAddToCart}
            />
            {catalogError && (
              <p className="max-w-7xl mx-auto px-4 pb-8 text-center text-sm text-rose-700">
                {catalogError} Verifique se a API Flask está em execução.
              </p>
            )}
          </>
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
                Ateliê Doce Encanto
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Bolos com ingredientes selecionados, confeitaria afetiva e excelência em cada detalhe.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Atendimento
              </h5>
              <ul className="text-xs text-stone-400 space-y-1">
                <li>• Encomendas sob medida</li>
                <li>• Ingredientes selecionados</li>
                <li>• Atendimento para momentos especiais</li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>© {new Date().getFullYear()} Ateliê Doce Encanto. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Feito com <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> e segurança de dados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
