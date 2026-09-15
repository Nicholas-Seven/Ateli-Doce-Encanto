import React, { useState } from 'react';
import { CakeProduct } from '../types';
import { formatBRL } from '../utils/masks';
import { Plus, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface CakeCatalogProps {
  products: CakeProduct[];
  onAddToCart: (product: CakeProduct, quantity: number) => void;
  openSecurityPanel: () => void;
}

export const CakeCatalog: React.FC<CakeCatalogProps> = ({
  products,
  onAddToCart,
  openSecurityPanel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [quantities, setQuantities] = useState<{ [id: number]: number }>({});
  const [addedAnimation, setAddedAnimation] = useState<{ [id: number]: boolean }>({});

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.categoria)))];

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.categoria === selectedCategory);

  const handleQuantityChange = (productId: number, val: number) => {
    const safeVal = Math.max(1, Math.min(val, 20)); // Limite seguro
    setQuantities(prev => ({ ...prev, [productId]: safeVal }));
  };

  const handleAdd = (product: CakeProduct) => {
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    
    // Feedback visual
    setAddedAnimation(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner / Hero da Doceria */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-white p-8 sm:p-12 mb-12 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/60 border border-amber-400/40 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Receitas Artesanais & Confeitaria Fina
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight mb-4 text-amber-50">
            Bolos feitos com amor, técnica e ingredientes nobres
          </h1>
          <p className="text-amber-100/90 text-base sm:text-lg leading-relaxed mb-6 font-light">
            Massa aveludada, recheios fartos e finalizações impecáveis. Cada bolo é preparado sob encomenda com o mais alto padrão gastronômico.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openSecurityPanel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 text-sm font-semibold hover:bg-amber-100 transition-all shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Ver os 7 Padrões de Segurança Ativos
            </button>
          </div>
        </div>
        
        {/* Detalhe decorativo suave */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      </section>

      {/* Filtros de Categoria */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Nosso Catálogo de Bolos
          </h2>
          <p className="text-stone-500 text-sm">
            Escolha o sabor perfeito para o seu momento especial
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-amber-100/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => {
          const currentQty = quantities[product.id] || 1;
          const isAdded = addedAnimation[product.id];

          return (
            <article
              key={product.id}
              id={`cake-card-${product.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-amber-200/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Imagem do Bolo */}
                <div className="relative h-64 overflow-hidden bg-stone-100">
                  <img
                    src={product.imagemUrl}
                    alt={product.nome}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-100 text-xs font-medium px-3 py-1 rounded-full">
                    {product.categoria}
                  </div>
                  {product.destaque && (
                    <div className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Mais Pedido
                    </div>
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold text-stone-900 leading-snug">
                      {product.nome}
                    </h3>
                  </div>

                  <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed mb-4">
                    {product.descricao}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-500 font-medium pb-4 border-b border-stone-100">
                    <span>⚖️ {product.pesoAproximado}</span>
                    <span>🍰 {product.porcoes}</span>
                  </div>
                </div>
              </div>

              {/* Barra de Ação & Preço */}
              <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-stone-400 block font-sans">Preço Oficial</span>
                    <span className="text-2xl font-bold font-sans text-amber-800">
                      {formatBRL(product.preco)}
                    </span>
                  </div>

                  {/* Tipagem de Input (type="number") + Limite */}
                  <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1">
                    <label htmlFor={`qty-${product.id}`} className="text-xs text-stone-500 px-1 font-medium">
                      Qtd:
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number" // Tipagem de inputs (Padrão 4)
                      min={1}
                      max={20} // Limite de caracteres/valores (Padrão 1)
                      value={currentQty}
                      onChange={e => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                      className="w-12 text-center text-sm font-semibold bg-white border border-stone-200 rounded-md py-1 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  id={`btn-add-cake-${product.id}`}
                  onClick={() => handleAdd(product)}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-md'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Adicionado ao Pedido!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Adicionar ao Pedido
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
