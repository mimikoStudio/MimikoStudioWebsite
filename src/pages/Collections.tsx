import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '../hooks/useData';

const categoryEmojis: Record<string, string> = {
  'clothing': '👗',
  'bags': '👜',
  'home-decor': '🏡',
  'accessories': '🌸',
  'gifts': '🎁',
  'small-creations': '🧵',
};

const defaultCategories = [
  { id: '1', name: 'Hand-Painted Clothing', slug: 'clothing', description: 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', image_url: '', display_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: '2', name: 'Designer Bags', slug: 'bags', description: 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', image_url: '', display_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: '3', name: 'Home Decor', slug: 'home-decor', description: 'Cushion covers, table runners, wall hangings & more', image_url: '', display_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: '4', name: 'Fashion Accessories', slug: 'accessories', description: 'Hand-painted shoes, caps, scarves & headbands', image_url: '', display_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: '5', name: 'Personalized Gifts', slug: 'gifts', description: 'Custom gift bags, aprons, bookmarks & pouches', image_url: '', display_order: 5, is_active: true, created_at: '', updated_at: '' },
  { id: '6', name: 'Small Creations', slug: 'small-creations', description: 'Scrunchies, hair bows, fabric earrings & keychains', image_url: '', display_order: 6, is_active: true, created_at: '', updated_at: '' },
];

export default function Collections() {
  const { categories, loading } = useCategories();
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner-luxury" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to="/shop"
                  className="card-luxury group p-10 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cream to-beige/30 flex items-center justify-center mb-6 group-hover:from-gold/15 group-hover:to-gold/5 transition-all duration-500 shadow-sm">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-500">
                      {categoryEmojis[cat.slug] || '✨'}
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl font-medium text-chocolate mb-3">{cat.name}</h3>
                  <p className="text-sm text-coffee/60 mb-4">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-label tracking-[0.15em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    View Collection <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          )}
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
