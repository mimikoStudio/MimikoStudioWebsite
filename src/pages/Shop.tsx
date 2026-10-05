import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createWhatsAppLink } from '../lib/supabase';
import { useProducts, useCategories } from '../hooks/useData';

const sortOptions = ['✨ Featured', '💰 Price: Low to High', '💰 Price: High to Low', '🆕 Newest'];

const productEmojis = ['👜', '🧣', '🛋️', '🧥', '👗', '🎁', '👕', '🌸', '💼', '🥻', '💎', '🎀'];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('✨ Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  
  const { categories } = useCategories();
  const { products, loading } = useProducts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchQuery || undefined,
  });

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy.includes('Low to High')) return a.price - b.price;
    if (sortBy.includes('High to Low')) return b.price - a.price;
    if (sortBy.includes('Newest')) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">🛍️ Browse</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">Shop</h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
            Explore our collection of handcrafted fabric art pieces, each one uniquely designed and lovingly created.
          </p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee/40" />
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-luxury !pl-10"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center gap-2 lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="select-luxury w-auto min-w-[180px]"
              >
                {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className={`flex flex-wrap gap-2 mb-12 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs font-label tracking-wider uppercase rounded-sm border transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-gold border-gold text-white'
                  : 'border-beige text-coffee/60 hover:border-gold hover:text-gold'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-label tracking-wider uppercase rounded-sm border transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-gold border-gold text-white'
                    : 'border-beige text-coffee/60 hover:border-gold hover:text-gold'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="spinner-luxury" />
            </div>
          )}

          {/* Products Grid */}
          {!loading && sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="text-coffee/40 text-lg">No products found matching your criteria.</p>
              <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="btn-secondary mt-6">
                View All Products
              </button>
            </div>
          )}

          {!loading && sortedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product, idx) => (
                <Link key={product.id} to={`/product/${product.slug}`} className="card-luxury group block">
                  <div className="relative aspect-square bg-gradient-to-br from-cream to-beige/20 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 && product.images[0]?.image_url ? (
                      <img 
                        src={product.images[0].image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover product-image-hover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.emoji-fallback')) {
                            const emoji = document.createElement('div');
                            emoji.className = 'emoji-fallback text-6xl';
                            emoji.textContent = productEmojis[idx % productEmojis.length];
                            parent.appendChild(emoji);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-6xl product-image-hover">{productEmojis[idx % productEmojis.length]}</span>
                    )}
                    {product.is_new_arrival && (
                      <span className="absolute top-3 left-3 badge-luxury bg-gold text-white">✨ New</span>
                    )}
                    {product.sale_price && (
                      <span className="absolute top-3 right-3 badge-luxury bg-blush text-white">🌷 Sale</span>
                    )}
                    <div className="absolute inset-0 bg-chocolate/0 group-hover:bg-chocolate/10 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-luxury hover:bg-gold hover:text-white transition-all"
                        aria-label="Add to wishlist"
                      >
                        <Heart size={16} className={isInWishlist(product.id) ? 'fill-blush text-blush' : ''} />
                      </button>
                      <button
                        onClick={() => addItem(product, 1)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-luxury hover:bg-gold hover:text-white transition-all"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-label tracking-[0.15em] uppercase text-gold mb-1">
                      {product.category?.name || 'Fabric Art'}
                    </p>
                    <h3 className="font-heading text-lg font-medium text-chocolate mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {product.sale_price ? (
                        <>
                          <span className="text-lg font-medium text-chocolate">₹{product.sale_price.toLocaleString()}</span>
                          <span className="text-sm text-coffee/40 line-through">₹{product.price.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-chocolate">₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {product.colors.slice(0, 3).map((color: string) => (
                          <span key={color} className="text-[10px] px-2 py-0.5 bg-cream/50 rounded text-coffee/60">{color}</span>
                        ))}
                      </div>
                    )}
                    <a
                      href={createWhatsAppLink(`Hi! I'm interested in: ${product.name} (₹${product.sale_price || product.price})`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full block text-center text-xs font-label tracking-wider uppercase text-gold border border-gold/30 py-2 rounded-sm hover:bg-gold hover:text-white transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      💬 Inquire on WhatsApp
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
