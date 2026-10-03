import React, { useState } from 'react';
import { Search, SlidersHorizontal, Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createWhatsAppLink } from '../lib/supabase';

const sampleProducts = [
  { id: '1', name: 'Floral Hand-Painted Tote', category: 'Bags', price: 1299, salePrice: 999, colors: ['Natural', 'Blush'], image: '👜', isNew: true, isFeatured: true },
  { id: '2', name: 'Abstract Art Dupatta', category: 'Clothing', price: 2499, salePrice: null, colors: ['Ivory', 'Sage'], image: '🧣', isNew: false, isFeatured: true },
  { id: '3', name: 'Botanical Cushion Cover Set', category: 'Home Decor', price: 1899, salePrice: 1499, colors: ['White', 'Beige'], image: '🛋️', isNew: true, isFeatured: false },
  { id: '4', name: 'Personalized Name T-Shirt', category: 'Clothing', price: 899, salePrice: null, colors: ['White', 'Black', 'Navy'], image: '👕', isNew: false, isFeatured: true },
  { id: '5', name: 'Hand-Painted Denim Jacket', category: 'Clothing', price: 3499, salePrice: 2999, colors: ['Blue', 'Black'], image: '🧥', isNew: true, isFeatured: true },
  { id: '6', name: 'Fabric Scrunchie Set', category: 'Small Creations', price: 499, salePrice: null, colors: ['Multi'], image: '🎀', isNew: false, isFeatured: false },
  { id: '7', name: 'Custom Gift Bag Collection', category: 'Gifts', price: 799, salePrice: 599, colors: ['Gold', 'Rose'], image: '🎁', isNew: true, isFeatured: false },
  { id: '8', name: 'Painted Canvas Sneakers', category: 'Accessories', price: 2199, salePrice: null, colors: ['White'], image: '👟', isNew: false, isFeatured: true },
  { id: '9', name: 'Table Runner - Floral', category: 'Home Decor', price: 1599, salePrice: 1299, colors: ['Cream', 'Sage'], image: '🌸', isNew: false, isFeatured: false },
  { id: '10', name: 'Laptop Sleeve - Abstract', category: 'Bags', price: 1799, salePrice: null, colors: ['Grey', 'Navy'], image: '💼', isNew: true, isFeatured: false },
  { id: '11', name: 'Hand-Painted Saree', category: 'Clothing', price: 4999, salePrice: 3999, colors: ['Red', 'Blue', 'Green'], image: '🥻', isNew: false, isFeatured: true },
  { id: '12', name: 'Fabric Brooch Collection', category: 'Small Creations', price: 399, salePrice: null, colors: ['Multi'], image: '💎', isNew: true, isFeatured: false },
];

const categories = ['All', 'Clothing', 'Bags', 'Home Decor', 'Accessories', 'Gifts', 'Small Creations'];
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addItem, toggleWishlist, isInWishlist } = useCart();

  const filteredProducts = sampleProducts
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Newest') return b.isNew ? 1 : -1;
      return b.isFeatured ? 1 : -1;
    });

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-espresso to-chocolate relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,114,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Browse</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-pearl mt-4 mb-6">Shop</h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-pearl/60 max-w-2xl mx-auto">
            Explore our collection of handcrafted fabric art pieces, each one uniquely designed and lovingly created.
          </p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-espresso/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-luxury !pl-10"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-luxury !py-3 !px-4 flex items-center gap-2 lg:hidden"
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
                    ? 'bg-champagne border-champagne text-pearl'
                    : 'border-beige text-espresso/60 hover:border-champagne hover:text-champagne'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-espresso/40 text-lg">No products found matching your criteria.</p>
              <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="btn-luxury mt-6">
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="card-luxury group">
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-champagne/5 to-beige/20 flex items-center justify-center overflow-hidden">
                    <span className="text-6xl product-image-hover">{product.image}</span>
                    {product.isNew && (
                      <span className="absolute top-3 left-3 badge-luxury bg-champagne text-pearl">New</span>
                    )}
                    {product.salePrice && (
                      <span className="absolute top-3 right-3 badge-luxury bg-rosegold text-pearl">Sale</span>
                    )}
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/10 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="w-10 h-10 bg-pearl rounded-full flex items-center justify-center shadow-md hover:bg-champagne hover:text-pearl transition-all"
                        aria-label="Add to wishlist"
                      >
                        <Heart size={16} className={isInWishlist(product.id) ? 'fill-champagne text-champagne' : ''} />
                      </button>
                      <button
                        onClick={() => addItem({ ...product, slug: product.name.toLowerCase().replace(/\s/g, '-'), description: '', stock_quantity: 10, material: 'Cotton', sizes: [], colors: product.colors, customization_available: true, is_featured: product.isFeatured, is_new_arrival: product.isNew, is_published: true, category_id: '', created_at: '', updated_at: '' } as any, 1)}
                        className="w-10 h-10 bg-pearl rounded-full flex items-center justify-center shadow-md hover:bg-champagne hover:text-pearl transition-all"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <p className="text-[10px] font-label tracking-[0.15em] uppercase text-champagne mb-1">{product.category}</p>
                    <h3 className="font-heading text-lg font-medium text-espresso mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-lg font-medium text-espresso">₹{product.salePrice.toLocaleString()}</span>
                          <span className="text-sm text-espresso/40 line-through">₹{product.price.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-espresso">₹{product.price.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-3">
                      {product.colors.map(color => (
                        <span key={color} className="text-[10px] px-2 py-0.5 bg-beige/30 rounded text-espresso/60">{color}</span>
                      ))}
                    </div>
                    <a
                      href={createWhatsAppLink(`Hi! I'm interested in: ${product.name} (₹${product.salePrice || product.price})`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full block text-center text-xs font-label tracking-wider uppercase text-champagne border border-champagne/30 py-2 rounded-sm hover:bg-champagne hover:text-pearl transition-all"
                    >
                      Inquire on WhatsApp
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
