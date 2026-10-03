import { useState } from 'react';
import { Search, SlidersHorizontal, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createWhatsAppLink } from '../lib/supabase';

const sampleProducts = [
  { id: '1', name: 'Floral Hand-Painted Tote', category: 'Bags', price: 1299, salePrice: 999, colors: ['Natural', 'Blush'], emoji: '👜', isNew: true, isFeatured: true },
  { id: '2', name: 'Abstract Art Dupatta', category: 'Clothing', price: 2499, salePrice: null, colors: ['Ivory', 'Sage'], emoji: '🧣', isNew: false, isFeatured: true },
  { id: '3', name: 'Botanical Cushion Cover Set', category: 'Home Decor', price: 1899, salePrice: 1499, colors: ['White', 'Beige'], emoji: '🛋️', isNew: true, isFeatured: false },
  { id: '4', name: 'Personalized Name T-Shirt', category: 'Clothing', price: 899, salePrice: null, colors: ['White', 'Black', 'Navy'], emoji: '👕', isNew: false, isFeatured: true },
  { id: '5', name: 'Hand-Painted Denim Jacket', category: 'Clothing', price: 3499, salePrice: 2999, colors: ['Blue', 'Black'], emoji: '🧥', isNew: true, isFeatured: true },
  { id: '6', name: 'Fabric Scrunchie Set', category: 'Small Creations', price: 499, salePrice: null, colors: ['Multi'], emoji: '🎀', isNew: false, isFeatured: false },
  { id: '7', name: 'Custom Gift Bag Collection', category: 'Gifts', price: 799, salePrice: 599, colors: ['Gold', 'Rose'], emoji: '🎁', isNew: true, isFeatured: false },
  { id: '8', name: 'Painted Canvas Sneakers', category: 'Accessories', price: 2199, salePrice: null, colors: ['White'], emoji: '👟', isNew: false, isFeatured: true },
  { id: '9', name: 'Table Runner - Floral', category: 'Home Decor', price: 1599, salePrice: 1299, colors: ['Cream', 'Sage'], emoji: '🌸', isNew: false, isFeatured: false },
  { id: '10', name: 'Laptop Sleeve - Abstract', category: 'Bags', price: 1799, salePrice: null, colors: ['Grey', 'Navy'], emoji: '💼', isNew: true, isFeatured: false },
  { id: '11', name: 'Hand-Painted Saree', category: 'Clothing', price: 4999, salePrice: 3999, colors: ['Red', 'Blue', 'Green'], emoji: '🥻', isNew: false, isFeatured: true },
  { id: '12', name: 'Fabric Brooch Collection', category: 'Small Creations', price: 399, salePrice: null, colors: ['Multi'], emoji: '💎', isNew: true, isFeatured: false },
];

const categories = ['All', '👗 Clothing', '👜 Bags', '🏡 Home Decor', '🌸 Accessories', '🎁 Gifts', '🧵 Small Creations'];
const sortOptions = ['✨ Featured', '💰 Price: Low to High', '💰 Price: High to Low', '🆕 Newest'];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('✨ Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem, toggleWishlist, isInWishlist } = useCart();

  const categoryMap: Record<string, string> = {
    '👗 Clothing': 'Clothing', '👜 Bags': 'Bags', '🏡 Home Decor': 'Home Decor',
    '🌸 Accessories': 'Accessories', '🎁 Gifts': 'Gifts', '🧵 Small Creations': 'Small Creations'
  };

  const filteredProducts = sampleProducts
    .filter(p => selectedCategory === 'All' || p.category === categoryMap[selectedCategory])
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy.includes('Low to High')) return a.price - b.price;
      if (sortBy.includes('High to Low')) return b.price - a.price;
      if (sortBy.includes('Newest')) return b.isNew ? 1 : -1;
      return b.isFeatured ? 1 : -1;
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
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-label tracking-wider uppercase rounded-sm border transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gold border-gold text-white'
                    : 'border-beige text-coffee/60 hover:border-gold hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🔍</span>
              <p className="text-coffee/40 text-lg">No products found matching your criteria.</p>
              <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="btn-secondary mt-6">
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="card-luxury group">
                  <div className="relative aspect-square bg-gradient-to-br from-cream to-beige/20 flex items-center justify-center overflow-hidden">
                    <span className="text-6xl product-image-hover">{product.emoji}</span>
                    {product.isNew && (
                      <span className="absolute top-3 left-3 badge-luxury bg-gold text-white">✨ New</span>
                    )}
                    {product.salePrice && (
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
                        onClick={() => addItem({ ...product, slug: product.name.toLowerCase().replace(/\s/g, '-'), description: '', stock_quantity: 10, material: 'Cotton', sizes: [], colors: product.colors, customization_available: true, is_featured: product.isFeatured, is_new_arrival: product.isNew, is_published: true, category_id: '', created_at: '', updated_at: '' } as any, 1)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-luxury hover:bg-gold hover:text-white transition-all"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-label tracking-[0.15em] uppercase text-gold mb-1">{product.category}</p>
                    <h3 className="font-heading text-lg font-medium text-chocolate mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-lg font-medium text-chocolate">₹{product.salePrice.toLocaleString()}</span>
                          <span className="text-sm text-coffee/40 line-through">₹{product.price.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-chocolate">₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-3">
                      {product.colors.map(color => (
                        <span key={color} className="text-[10px] px-2 py-0.5 bg-cream/50 rounded text-coffee/60">{color}</span>
                      ))}
                    </div>
                    <a
                      href={createWhatsAppLink(`Hi! I'm interested in: ${product.name} (₹${product.salePrice || product.price})`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full block text-center text-xs font-label tracking-wider uppercase text-gold border border-gold/30 py-2 rounded-sm hover:bg-gold hover:text-white transition-all"
                    >
                      💬 Inquire on WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
