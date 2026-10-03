import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Palette, Sparkles, Award } from 'lucide-react';

export default function OurStory() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-espresso to-chocolate relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,114,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Our Journey</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-pearl mt-4 mb-6">Our Story</h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-pearl/60 max-w-2xl mx-auto italic">
            "Every brushstroke carries a piece of our heart."
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-24 bg-ivory">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-center mb-16">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-champagne/10 flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
              <h2 className="font-heading text-3xl font-light text-espresso mb-6">
                From a Passion for Art to a Studio of Dreams
              </h2>
              <div className="gold-divider w-16 mx-auto" />
            </div>

            <div className="space-y-8 text-espresso/70 leading-relaxed">
              <p>
                Mimiko Studio was born from a simple yet profound belief — that art should be wearable, touchable, and part of everyday life. What started as a personal passion for fabric painting has blossomed into a creative studio where handmade artistry meets modern design.
              </p>
              <p>
                The name "Mimiko" reflects our philosophy of blending creativity with care. Every piece that leaves our studio carries the warmth of human touch, the precision of skilled craftsmanship, and the uniqueness that only handmade art can offer.
              </p>
              <p>
                Our journey began with a brush, some fabric colors, and a dream to create something beautiful. Today, we paint on clothing, bags, home decor, accessories, and create personalized gifts that become cherished keepsakes. Each creation is a collaboration between our artistic vision and your personal style.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { icon: <Heart size={24} />, title: 'Made with Love', desc: 'Every piece is created with genuine passion and attention to detail.' },
              { icon: <Palette size={24} />, title: 'Artistic Expression', desc: 'We believe in the power of art to transform the ordinary into the extraordinary.' },
              { icon: <Sparkles size={24} />, title: 'Uniqueness', desc: 'No two pieces are exactly alike. Your creation will be truly one-of-a-kind.' },
              { icon: <Award size={24} />, title: 'Quality Promise', desc: 'We use premium materials and techniques to ensure lasting beauty.' },
            ].map((value, i) => (
              <div key={i} className="p-8 bg-pearl border border-beige/20 rounded-sm text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-champagne/10 flex items-center justify-center text-champagne">
                  {value.icon}
                </div>
                <h3 className="font-heading text-xl font-medium text-espresso mb-2">{value.title}</h3>
                <p className="text-sm text-espresso/60">{value.desc}</p>
              </div>
            ))}
          </div>

          {/* Process */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-light text-espresso">Our Creative Process</h2>
              <div className="gold-divider w-16 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Consultation', desc: 'We discuss your vision, preferences, and ideas.' },
                { step: '02', title: 'Design', desc: 'Our artists create a concept tailored to your style.' },
                { step: '03', title: 'Creation', desc: 'Meticulous hand-painting with premium fabric colors.' },
                { step: '04', title: 'Delivery', desc: 'Your unique creation, carefully packaged and delivered.' },
              ].map((step, i) => (
                <div key={i} className="text-center p-6">
                  <span className="text-4xl font-heading text-champagne/30">{step.step}</span>
                  <h3 className="font-heading text-lg font-medium text-espresso mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-espresso/60">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center p-12 bg-gradient-to-br from-espresso to-chocolate rounded-sm">
            <h2 className="font-heading text-2xl sm:text-3xl font-light text-pearl mb-4">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-pearl/60 mb-8">Let's bring your vision to life together.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/custom-creations" className="btn-luxury-filled">Start Your Creation</Link>
              <Link to="/book-appointment" className="btn-luxury !border-pearl/30 !text-pearl">Book Consultation</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
