import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { INSTAGRAM_URL } from '../lib/supabase';
import HeroCarousel from '../components/HeroCarousel';

export default function Home() {
  return (
    <div style={{ overflow: 'hidden', backgroundColor: '#FFF5E9' }}>
      {/* Dynamic Hero Carousel */}
      <HeroCarousel />

      {/* Welcome Section */}
      <section style={{ padding: '6rem 1rem', backgroundColor: '#FFF5E9' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#D5AA64', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Welcome to
          </span>
          <h2 style={{ 
            fontFamily: 'Cormorant Garamond, serif', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: 300, 
            color: '#4B2818', 
            marginTop: '1rem' 
          }}>
            Mimiko Studio
          </h2>
          <div style={{ 
            height: '1px', 
            width: '6rem', 
            margin: '1.5rem auto',
            background: 'linear-gradient(90deg, transparent, #D5AA64, transparent)'
          }} />
          <p style={{ color: 'rgba(107,62,40,0.7)', fontSize: '1.125rem', maxWidth: '42rem', margin: '0 auto', lineHeight: 1.6 }}>
            A premium handmade fabric art studio where creativity meets elegance. Every brushstroke carries a piece of our heart.
          </p>
          <p style={{ color: '#D5AA64', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontStyle: 'italic', marginTop: '1rem' }}>
            Paint ♥ Create ♥ Be You
          </p>
        </div>
      </section>

      {/* Collections Section */}
      <section style={{ padding: '6rem 1rem', backgroundColor: 'rgba(249,235,221,0.5)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#D5AA64', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Curated For You
            </span>
            <h2 style={{ 
              fontFamily: 'Cormorant Garamond, serif', 
              fontSize: 'clamp(1.875rem, 3vw, 2.5rem)', 
              fontWeight: 300, 
              color: '#4B2818', 
              marginTop: '1rem' 
            }}>
              ✨ Explore Our Collections
            </h2>
            <div style={{ 
              height: '1px', 
              width: '6rem', 
              margin: '1.5rem auto',
              background: 'linear-gradient(90deg, transparent, #D5AA64, transparent)'
            }} />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {[
              { title: 'Hand-Painted Clothing', desc: 'Wearable art that tells your story', emoji: '👗' },
              { title: 'Designer Tote Bags', desc: 'Carry creativity wherever you go', emoji: '👜' },
              { title: 'Custom Dupattas', desc: 'Elegance painted by hand', emoji: '🧣' },
              { title: 'Artistic Home Decor', desc: 'Transform spaces with art', emoji: '🏡' },
              { title: 'Personalized Gifts', desc: 'Thoughtful, one-of-a-kind presents', emoji: '🎁' },
              { title: 'Exclusive Custom Creations', desc: 'Your vision, our artistry', emoji: '✨' },
            ].map((collection, i) => (
              <Link
                key={i}
                to="/shop"
                style={{
                  backgroundColor: '#FFFCF7',
                  border: '1px solid rgba(213,170,100,0.15)',
                  borderRadius: '4px',
                  padding: '2rem',
                  textDecoration: 'none',
                  transition: 'all 0.4s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '12rem',
                  borderRadius: '2px',
                  background: 'linear-gradient(135deg, rgba(242,160,180,0.1) 0%, rgba(233,133,161,0.05) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '3rem' }}>{collection.emoji}</span>
                </div>
                <h3 style={{ 
                  fontFamily: 'Cormorant Garamond, serif', 
                  fontSize: '1.25rem', 
                  fontWeight: 500, 
                  color: '#4B2818', 
                  marginBottom: '0.5rem' 
                }}>
                  {collection.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(107,62,40,0.6)', marginBottom: '1rem', flex: 1 }}>
                  {collection.desc}
                </p>
                <span style={{ 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  color: '#D5AA64',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
