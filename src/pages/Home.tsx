import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Palette, Gift, Star, Heart } from 'lucide-react';

const collections = [
  { title: 'Hand-Painted Clothing', desc: 'Wearable art that tells your story', icon: '👗', color: 'from-rosegold/20 to-blush/20' },
  { title: 'Designer Tote Bags', desc: 'Carry creativity wherever you go', icon: '👜', color: 'from-champagne/20 to-beige/20' },
  { title: 'Custom Dupattas', desc: 'Elegance painted by hand', icon: '🧣', color: 'from-sage/20 to-ivory' },
  { title: 'Artistic Home Decor', desc: 'Transform spaces with art', icon: '🏠', color: 'from-blush/20 to-rosegold/10' },
  { title: 'Personalized Gifts', desc: 'Thoughtful, one-of-a-kind presents', icon: '🎁', color: 'from-champagne/10 to-champagne/20' },
  { title: 'Exclusive Custom Creations', desc: 'Your vision, our artistry', icon: '✨', color: 'from-espresso/5 to-champagne/10' },
];

const features = [
  { icon: <Palette size={24} />, title: 'Hand-Painted', desc: 'Every piece is meticulously painted by hand with premium fabric colors' },
  { icon: <Sparkles size={24} />, title: 'Unique Designs', desc: 'No two pieces are exactly alike — each creation is one-of-a-kind' },
  { icon: <Heart size={24} />, title: 'Made with Love', desc: 'Crafted with passion, care, and attention to every detail' },
  { icon: <Gift size={24} />, title: 'Customizable', desc: 'Personalize any piece to match your style and preferences' },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-espresso via-chocolate to-espresso">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,114,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(185,139,120,0.2) 0%, transparent 40%),
                             radial-gradient(circle at 60% 80%, rgba(212,175,114,0.15) 0%, transparent 40%)`
          }} />
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-64 h-64 border border-champagne/10 rounded-full" />
          <div className="absolute bottom-40 left-10 w-96 h-96 border border-champagne/5 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-rosegold/10 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-champagne" />
              <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Handcrafted Fabric Art</span>
            </div>
            
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light text-pearl leading-tight mb-8">
              Artistry Woven<br />
              <span className="italic text-champagne">Into Every</span><br />
              Creation.
            </h1>
            
            <p className="text-pearl/70 text-lg sm:text-xl font-light leading-relaxed max-w-xl mb-12">
              Discover the beauty of handmade fabric art, thoughtfully painted and uniquely designed for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/collections" className="btn-luxury-filled group">
                Explore the Collection
                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/custom-creations" className="btn-luxury !border-pearl/30 !text-pearl hover:!bg-pearl/10">
                Create Your Own Design
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-pearl/40 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-champagne to-transparent" />
        </div>
      </section>

      {/* Brand Promise */}
      <section className="py-20 bg-pearl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">The Mimiko Promise</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-espresso mt-4">
              Where Art Meets Fabric
            </h2>
            <div className="gold-divider w-24 mx-auto mt-6" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center p-8 group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-champagne/10 flex items-center justify-center text-champagne group-hover:bg-champagne group-hover:text-pearl transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-xl font-medium text-espresso mb-3">{feature.title}</h3>
                <p className="text-sm text-espresso/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Curated For You</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-espresso mt-4">
              Our Collections
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
                <div className={`w-full h-48 rounded-sm bg-gradient-to-br ${collection.color} flex items-center justify-center mb-6 group-hover:shadow-inner transition-all duration-500`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{collection.icon}</span>
                </div>
                <h3 className="font-heading text-xl font-medium text-espresso mb-2">{collection.title}</h3>
                <p className="text-sm text-espresso/60 mb-4 flex-1">{collection.desc}</p>
                <span className="text-xs font-label tracking-[0.15em] uppercase text-champagne flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-24 bg-espresso relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(212,175,114,0.4) 0%, transparent 50%)`
        }} />
        <div className="absolute top-10 right-10 w-48 h-48 border border-champagne/10 rounded-full" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Signature Creations</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-light text-pearl mt-4 mb-6">
                The Art Behind<br />
                <span className="italic text-champagne">Every Brushstroke</span>
              </h2>
              <p className="text-pearl/60 leading-relaxed mb-8">
                Each creation at Mimiko Studio begins with a blank canvas of premium fabric and transforms into a wearable masterpiece. Our artisans use specialized fabric paints and techniques passed down through years of dedication, ensuring every piece is not just beautiful, but built to last.
              </p>
              <p className="text-pearl/60 leading-relaxed mb-8">
                From delicate florals to bold abstracts, from personalized lettering to intricate traditional motifs — we bring your vision to life with meticulous attention to detail and an unwavering commitment to quality.
              </p>
              <Link to="/our-story" className="btn-luxury !border-champagne !text-champagne hover:!bg-champagne hover:!text-pearl">
                Discover Our Journey
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-br from-rosegold/30 to-blush/20 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">🎨</span>
                </div>
                <div className="h-64 bg-gradient-to-br from-champagne/20 to-beige/30 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">🖌️</span>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 bg-gradient-to-br from-sage/20 to-ivory/30 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">🌸</span>
                </div>
                <div className="h-48 bg-gradient-to-br from-blush/30 to-rosegold/20 rounded-sm flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customize CTA */}
      <section className="py-24 bg-pearl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Personalize</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-light text-espresso mt-4 mb-6">
            Customize Your Creation
          </h2>
          <div className="gold-divider w-24 mx-auto mb-8" />
          <p className="text-espresso/60 leading-relaxed max-w-2xl mx-auto mb-12">
            Have a unique vision? We'd love to bring it to life. From custom designs to personalized gifts, our studio creates one-of-a-kind pieces tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/custom-creations" className="btn-luxury-filled">
              Design Your Own
            </Link>
            <Link to="/book-appointment" className="btn-luxury">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Follow Our Journey</span>
            <h2 className="font-heading text-3xl font-light text-espresso mt-4">@mimiko.studio24</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🌺', '🎨', '👗', '👜', '🌸', '✨', '🖌️', '🎁'].map((emoji, i) => (
              <a
                key={i}
                href="https://www.instagram.com/mimiko.studio24/"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-gradient-to-br from-champagne/10 to-beige/20 rounded-sm flex items-center justify-center text-4xl hover:scale-105 transition-transform duration-300 group relative overflow-hidden"
              >
                {emoji}
                <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-pearl opacity-0 group-hover:opacity-100 transition-opacity text-sm font-label tracking-wider">View</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-espresso to-chocolate">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star size={24} className="text-champagne mx-auto mb-6" />
          <h2 className="font-heading text-2xl sm:text-3xl font-light text-pearl mb-4">
            Stay Inspired
          </h2>
          <p className="text-pearl/60 mb-8">
            Be the first to know about new collections, exclusive offers, and behind-the-scenes artistry.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-pearl/10 border border-pearl/20 text-pearl text-sm rounded-sm focus:outline-none focus:border-champagne placeholder:text-pearl/30"
            />
            <button className="btn-luxury-filled !py-3 !px-6">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
