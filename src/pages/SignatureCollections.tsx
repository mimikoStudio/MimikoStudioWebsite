import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getImageUrl } from '../lib/imageUtils';

interface Collection {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  long_description?: string;
  cover_image_url?: string;
  background_image_url?: string;
  button_text?: string;
  button_url?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}

export default function SignatureCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading collections:', error);
        setCollections([]);
      } else {
        console.log('✅ Collections loaded:', data?.length || 0);
        setCollections(data || []);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="spinner-luxury" />
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">💎 Exclusive</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">
            Signature Collections
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
            Discover our curated signature collections, each piece telling a unique story of creativity and craftsmanship.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {collections.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">💎</span>
              <p className="text-coffee/40 text-lg mb-4">No signature collections available yet.</p>
              <p className="text-coffee/50 text-sm">
                Check back soon for our exclusive curated collections!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="curved-card bg-pearl group shadow-curved hover:shadow-curved-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Cover Image */}
                  {collection.cover_image_url && (
                    <div className="aspect-video overflow-hidden curved-image-sm">
                      <img
                        src={getImageUrl(collection.cover_image_url) || ''}
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          console.error('❌ Failed to load collection image:', collection.cover_image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('✅ Collection image loaded:', collection.name);
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-8">
                    {collection.is_featured && (
                      <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs font-label tracking-wider uppercase rounded-sm mb-3">
                        Featured
                      </span>
                    )}
                    
                    <h3 className="font-heading text-2xl font-medium text-chocolate mb-3">
                      {collection.name}
                    </h3>
                    
                    {collection.short_description && (
                      <p className="text-sm text-coffee/60 mb-6 line-clamp-3">
                        {collection.short_description}
                      </p>
                    )}

                    {collection.button_text && collection.button_url && (
                      <Link
                        to={collection.button_url}
                        className="inline-flex items-center gap-2 text-sm font-label tracking-wider uppercase text-gold hover:text-chocolate transition-colors"
                      >
                        {collection.button_text}
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-light text-chocolate mb-4">
            Looking for Something Special?
          </h2>
          <p className="text-coffee/60 mb-8">
            We create custom pieces tailored to your vision. Let's bring your ideas to life.
          </p>
          <Link to="/custom-creations" className="btn-primary">
            🎨 Create Something Custom
          </Link>
        </div>
      </section>
    </div>
  );
}
