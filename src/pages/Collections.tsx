import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Hand-Painted Clothing', slug: 'clothing', desc: 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', icon: '👗', count: 24 },
  { name: 'Designer Bags', slug: 'bags', desc: 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', icon: '👜', count: 18 },
  { name: 'Home Decor', slug: 'home-decor', desc: 'Cushion covers, table runners, wall hangings & more', icon: '🏠', count: 15 },
  { name: 'Fashion Accessories', slug: 'accessories', desc: 'Hand-painted shoes, caps, scarves & headbands', icon: '👒', count: 12 },
  { name: 'Personalized Gifts', slug: 'gifts', desc: 'Custom gift bags, aprons, bookmarks & pouches', icon: '🎁', count: 20 },
  { name: 'Small Creations', slug: 'small-creations', desc: 'Scrunchies, hair bows, fabric earrings & keychains', icon: '✨', count: 30 },
];

export default function Collections() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-espresso to-chocolate relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,114,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Explore</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-pearl mt-4 mb-6">
            Our Collections
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-pearl/60 max-w-2xl mx-auto">
            Discover our curated collections of handcrafted fabric art, each piece telling a unique story of creativity and craftsmanship.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                to="/shop"
                className="card-luxury group p-10 flex flex-col items-center text-center"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-champagne/10 to-beige/20 flex items-center justify-center mb-6 group-hover:from-champagne/20 group-hover:to-champagne/10 transition-all duration-500">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{cat.icon}</span>
                </div>
                <h3 className="font-heading text-2xl font-medium text-espresso mb-3">{cat.name}</h3>
                <p className="text-sm text-espresso/60 mb-4">{cat.desc}</p>
                <span className="text-xs text-champagne font-label tracking-wider">{cat.count} pieces</span>
                <div className="mt-4 flex items-center gap-2 text-xs font-label tracking-[0.15em] uppercase text-champagne opacity-0 group-hover:opacity-100 transition-opacity">
                  View Collection <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-pearl">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-light text-espresso mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-espresso/60 mb-8">We create custom pieces tailored to your vision. Let's bring your ideas to life.</p>
          <Link to="/custom-creations" className="btn-luxury-filled">
            Create Something Custom
          </Link>
        </div>
      </section>
    </div>
  );
}
