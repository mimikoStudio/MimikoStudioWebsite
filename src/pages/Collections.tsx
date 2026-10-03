import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  { name: 'Hand-Painted Clothing', slug: 'clothing', desc: 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', emoji: '👗', count: 24 },
  { name: 'Designer Bags', slug: 'bags', desc: 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', emoji: '👜', count: 18 },
  { name: 'Home Decor', slug: 'home-decor', desc: 'Cushion covers, table runners, wall hangings & more', emoji: '🏡', count: 15 },
  { name: 'Fashion Accessories', slug: 'accessories', desc: 'Hand-painted shoes, caps, scarves & headbands', emoji: '🌸', count: 12 },
  { name: 'Personalized Gifts', slug: 'gifts', desc: 'Custom gift bags, aprons, bookmarks & pouches', emoji: '🎁', count: 20 },
  { name: 'Small Creations', slug: 'small-creations', desc: 'Scrunchies, hair bows, fabric earrings & keychains', emoji: '🧵', count: 30 },
];

export default function Collections() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">💎 Explore</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">
            Signature Collection
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
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
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cream to-beige/30 flex items-center justify-center mb-6 group-hover:from-gold/15 group-hover:to-gold/5 transition-all duration-500 shadow-sm">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{cat.emoji}</span>
                </div>
                <h3 className="font-heading text-2xl font-medium text-chocolate mb-3">{cat.name}</h3>
                <p className="text-sm text-coffee/60 mb-4">{cat.desc}</p>
                <span className="text-xs text-gold font-label tracking-wider">{cat.count} pieces</span>
                <div className="mt-4 flex items-center gap-2 text-xs font-label tracking-[0.15em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Collection <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-light text-chocolate mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-coffee/60 mb-8">We create custom pieces tailored to your vision. Let's bring your ideas to life.</p>
          <Link to="/custom-creations" className="btn-primary">
            🎨 Create Something Custom
          </Link>
        </div>
      </section>
    </div>
  );
}
