import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Palette, Gift, Heart, Star } from 'lucide-react';
import { INSTAGRAM_URL } from '../lib/supabase';

const collections = [
  { title: 'Hand-Painted Clothing', desc: 'Wearable art that tells your story', emoji: '👗', gradient: 'from-blush/20 to-rose/10' },
  { title: 'Designer Tote Bags', desc: 'Carry creativity wherever you go', emoji: '👜', gradient: 'from-gold/15 to-beige/30' },
  { title: 'Custom Dupattas', desc: 'Elegance painted by hand', emoji: '🧣', gradient: 'from-sage/15 to-leaf/10' },
  { title: 'Artistic Home Decor', desc: 'Transform spaces with art', emoji: '🏡', gradient: 'from-sky/10 to-blush/10' },
  { title: 'Personalized Gifts', desc: 'Thoughtful, one-of-a-kind presents', emoji: '🎁', gradient: 'from-gold/10 to-cream' },
  { title: 'Exclusive Custom Creations', desc: 'Your vision, our artistry', emoji: '✨', gradient: 'from-chocolate/5 to-gold/10' },
];

const features = [
  { emoji: '🎨', title: 'Hand-Painted', desc: 'Every piece is meticulously painted by hand with premium fabric colors' },
  { emoji: '✨', title: 'Unique Designs', desc: 'No two pieces are exactly alike — each creation is one-of-a-kind' },
  { emoji: '💖', title: 'Made with Love', desc: 'Crafted with passion, care, and attention to every detail' },
  { emoji: '🎁', title: 'Customizable', desc: 'Personalize any piece to match your style and preferences' },
];

const newArrivals = [
  { id: 1, name: 'Floral Paradise Tote', price: 1299, emoji: '👜', tag: 'New' },
  { id: 2, name: 'Abstract Art Dupatta', price: 2499, emoji: '🧣', tag: 'New' },
  { id: 3, name: 'Botanical Cushion Set', price: 1899, emoji: '🛋️', tag: 'New' },
  { id: 4, name: 'Painted Denim Jacket', price: 3499, emoji: '🧥', tag: 'Bestseller' },
];

const testimonials = [
  { name: 'Priya S.', text: 'The hand-painted dupatta I ordered was absolutely stunning! Every detail was perfect.', rating: 5 },
  { name: 'Ananya R.', text: 'Mimiko Studio turned my idea into a beautiful reality. The tote bag is my favorite possession now!', rating: 5 },
  { name: 'Kavya M.', text: 'Incredible craftsmanship and such a personal touch. Will definitely order again!', rating: 5 },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-chocolate via-coffee to-chocolate">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(213,170,100,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(242,160,180,0.15) 0%, transparent 40%),
                             radial-gradient(circle at 60% 80%, rgba(213,170,100,0.2) 0%, transparent 40%)`
          }} />
          <div className="absolute top-20 right-20 w-72 h-72 border border-gold/10 rounded-full" />
          <div className="absolute bottom-40 left-10 w-96 h-96 border border-gold/5 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 border border-blush/10 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gold" />
              <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">Handcrafted Fabric Art</span>
            </div>
            
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light text-ivory leading-tight mb-4">
              Where Art Meets
            </h1>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light italic text-gold leading-tight mb-6">
              Elegance.
            </h1>
            
            <p className="text-ivory/70 text-lg sm:text-xl font-light leading-relaxed max-w-xl mb-4">
              Hand-Painted Creations, Made With Love.
            </p>
            <p className="text-ivory/50 text-base leading-relaxed max-w-lg mb-12">
              Explore the beauty of personalized fabric art, thoughtfully designed to express your unique style.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/collections" className="btn-primary group">
                ✨ Explore Our Collection
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/custom-creations" className="btn-secondary !border-ivory/40 !text-ivory hover:!bg-ivory/10">
                🎨 Create Your Own Design
              </Link>
            </div>
          </div>

          {/* Logo display */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-72 h-72 rounded-full bg-ivory/5 border border-gold/20 flex items-center justify-center animate-float">
              <div className="text-center">
                <span className="text-7xl block mb-2">🐱</span>
                <span className="text-5xl block">🐼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-ivory/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">Welcome to</span>
            <h2 className="font-heading text-4xl sm:text-5xl font-light text-chocolate mt-4">
              Mimiko Studio
            </h2>
            <div className="gold-divider w-24 mx-auto mt-6 mb-6" />
            <p className="text-coffee/70 text-lg max-w-2xl mx-auto leading-relaxed">
              A premium handmade fabric art studio where creativity meets elegance. Every brushstroke carries a piece of our heart.
            </p>
            <p className="text-gold font-heading text-xl italic mt-4">Paint ♥ Create ♥ Be You</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center p-8 group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-cream to-beige/30 flex items-center justify-center text-2xl group-hover:from-gold/20 group-hover:to-gold/10 transition-all duration-500 shadow-sm">
                  {feature.emoji}
                </div>
                <h3 className="font-heading text-xl font-medium text-chocolate mb-3">{feature.title}</h3>
                <p className="text-sm text-coffee/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-cream/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">Curated For You</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-chocolate mt-4">
              ✨ Explore Our Collections
            </h2>
            <div className="gold-divider w-24 mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, i) => (
              <Link
                key={i}
                to="/shop"
                className="card-luxury group p-8 flex flex-col"
              >
                <div className={`w-full h-48 rounded-sm bg-gradient-to-br ${collection.gradient} flex items-center justify-center mb-6 group-hover:shadow-inner transition-all duration-500`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{collection.emoji}</span>
                </div>
                <h3 className="font-heading text-xl font-medium text-chocolate mb-2">{collection.title}</h3>
                <p className="text-sm text-coffee/60 mb-4 flex-1">{collection.desc}</p>
                <span className="text-xs font-label tracking-[0.15em] uppercase text-gold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">Just Landed</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-chocolate mt-4">
              ✨ New Arrivals
            </h2>
            <div className="gold-divider w-24 mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <div key={product.id} className="card-luxury group">
                <div className="relative aspect-square bg-gradient-to-br from-cream to-beige/20 flex items-center justify-center overflow-hidden">
                  <span className="text-6xl product-image-hover">{product.emoji}</span>
                  <span className="absolute top-3 left-3 badge-luxury bg-gold text-white">{product.tag}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-medium text-chocolate mb-2">{product.name}</h3>
                  <p className="text-lg font-medium text-chocolate">₹{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-secondary">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-24 bg-chocolate relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(213,170,100,0.4) 0%, transparent 50%)`
        }} />
        <div className="absolute top-10 right-10 w-48 h-48 border border-gold/10 rounded-full" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">Signature Creations</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-light text-ivory mt-4 mb-6">
                The Art Behind<br />
                <span className="italic text-gold">Every Brushstroke</span>
              </h2>
              <p className="text-ivory/60 leading-relaxed mb-6">
                Each creation at Mimiko Studio begins with a blank canvas of premium fabric and transforms into a wearable masterpiece. Our artisans use specialized fabric paints and techniques passed down through years of dedication.
              </p>
              <p className="text-ivory/60 leading-relaxed mb-8">
                From delicate florals to bold abstracts, from personalized lettering to intricate traditional motifs — we bring your vision to life with meticulous attention to detail.
              </p>
              <Link to="/our-story" className="btn-secondary !border-gold !text-gold hover:!bg-gold hover:!text-chocolate">
                🐼 Discover Our Journey
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-br from-blush/20 to-rose/10 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">🌸</span>
                </div>
                <div className="h-64 bg-gradient-to-br from-gold/15 to-beige/20 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">🖌️</span>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-gradient-to-br from-sage/15 to-leaf/10 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">🌿</span>
                </div>
                <div className="h-48 bg-gradient-to-br from-sky/10 to-blush/10 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customize CTA */}
      <section className="py-24 bg-cream/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">💖 Personalize</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-light text-chocolate mt-4 mb-6">
            Customize Your Creation
          </h2>
          <div className="gold-divider w-24 mx-auto mb-8" />
          <p className="text-coffee/60 leading-relaxed max-w-2xl mx-auto mb-12">
            Have a unique vision? We'd love to bring it to life. From custom designs to personalized gifts, our studio creates one-of-a-kind pieces tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/custom-creations" className="btn-primary">
              🎨 Design Your Own
            </Link>
            <Link to="/book-appointment" className="btn-secondary">
              📅 Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">⭐ Testimonials</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-chocolate mt-4">
              What Our Customers Say
            </h2>
            <div className="gold-divider w-24 mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-pearl border border-beige/20 rounded-sm p-8 text-center shadow-luxury">
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-coffee/70 italic leading-relaxed mb-6">"{testimonial.text}"</p>
                <p className="text-sm font-label tracking-wider text-chocolate font-medium">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-24 bg-cream/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">📱 Follow Our Journey</span>
            <h2 className="font-heading text-3xl font-light text-chocolate mt-4">@mimiko.studio24</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🌺', '🎨', '👗', '👜', '🌸', '✨', '🖌️', '🎁'].map((emoji, i) => (
              <a
                key={i}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-gradient-to-br from-gold/10 to-cream/30 rounded-sm flex items-center justify-center text-4xl hover:scale-105 transition-transform duration-300 group relative overflow-hidden"
              >
                {emoji}
                <div className="absolute inset-0 bg-chocolate/0 group-hover:bg-chocolate/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-ivory opacity-0 group-hover:opacity-100 transition-opacity text-sm font-label tracking-wider">View</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-chocolate to-coffee">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-3xl mb-4 block">💌</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-light text-ivory mb-4">
            Stay Inspired
          </h2>
          <p className="text-ivory/60 mb-8">
            Be the first to know about new collections, exclusive offers, and behind-the-scenes artistry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-ivory/10 border border-ivory/20 text-ivory text-sm rounded-sm focus:outline-none focus:border-gold placeholder:text-ivory/30"
            />
            <button className="btn-primary !py-3 !px-6">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
