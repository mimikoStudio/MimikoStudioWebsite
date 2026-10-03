import React, { useState } from 'react';
import { INSTAGRAM_URL } from '../lib/supabase';

const galleryItems = [
  { id: 1, emoji: '🌸', title: 'Floral Tote Bag', category: 'Bags', color: 'from-blush/30 to-rosegold/20' },
  { id: 2, emoji: '👗', title: 'Hand-Painted Kurti', category: 'Clothing', color: 'from-champagne/20 to-beige/30' },
  { id: 3, emoji: '🎨', title: 'Abstract Art Saree', category: 'Clothing', color: 'from-sage/20 to-ivory' },
  { id: 4, emoji: '👜', title: 'Designer Canvas Bag', category: 'Bags', color: 'from-rosegold/20 to-blush/20' },
  { id: 5, emoji: '🧣', title: 'Custom Dupatta', category: 'Clothing', color: 'from-champagne/10 to-champagne/20' },
  { id: 6, emoji: '🛋️', title: 'Botanical Cushions', category: 'Home Decor', color: 'from-sage/20 to-beige/20' },
  { id: 7, emoji: '🎀', title: 'Fabric Scrunchie Set', category: 'Small Creations', color: 'from-blush/30 to-champagne/10' },
  { id: 8, emoji: '🧥', title: 'Painted Denim Jacket', category: 'Clothing', color: 'from-espresso/5 to-champagne/10' },
  { id: 9, emoji: '🎁', title: 'Custom Gift Set', category: 'Gifts', color: 'from-champagne/20 to-rosegold/10' },
  { id: 10, emoji: '👟', title: 'Art Sneakers', category: 'Accessories', color: 'from-beige/30 to-champagne/10' },
  { id: 11, emoji: '🌺', title: 'Tropical Tote', category: 'Bags', color: 'from-sage/20 to-blush/10' },
  { id: 12, emoji: '✨', title: 'Personalized Pouch', category: 'Gifts', color: 'from-champagne/20 to-beige/20' },
];

const filterCategories = ['All', 'Clothing', 'Bags', 'Home Decor', 'Accessories', 'Gifts', 'Small Creations'];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-espresso to-chocolate relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,114,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Portfolio</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-pearl mt-4 mb-6">Gallery</h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-pearl/60 max-w-2xl mx-auto">
            A showcase of our handcrafted creations — each piece unique, each story beautiful.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-xs font-label tracking-wider uppercase rounded-sm border transition-all duration-300 ${
                  activeFilter === cat
                    ? 'bg-champagne border-champagne text-pearl'
                    : 'border-beige text-espresso/60 hover:border-champagne hover:text-champagne'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(item => (
              <div key={item.id} className="card-luxury group cursor-pointer">
                <div className={`aspect-square bg-gradient-to-br ${item.color} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                  <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/20 transition-all duration-300 flex items-end justify-start p-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-pearl text-sm font-medium">{item.title}</p>
                      <p className="text-pearl/70 text-xs">{item.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instagram CTA */}
          <div className="mt-16 text-center">
            <p className="text-espresso/60 mb-4">Follow us for more creations and behind-the-scenes content</p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow @mimiko.studio24
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
