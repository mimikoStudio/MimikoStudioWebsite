import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer() {
  const { settings } = useSiteSettings();

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('🎨 Footer: Settings updated, re-rendering...');
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  return (
    <footer className="bg-chocolate text-ivory/80">
      <div className="gold-divider-thick" />
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_name}
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30';
                      fallback.innerHTML = '<span class="text-xl" role="img" aria-label="Mimiko">🎨</span>';
                      parent.insertBefore(fallback, parent.firstChild);
                    }
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                  <span className="text-xl" role="img" aria-label="Mimiko">🎨</span>
                </div>
              )}
              <div>
                <h3 className="font-heading text-xl font-semibold text-ivory">{settings.site_name}</h3>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold">Fabric Art</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ivory/50 mb-6">
              {settings.footer_about_text || 'Handcrafted fabric art, thoughtfully painted and uniquely designed for you. Each piece tells a story of creativity and passion.'}
            </p>
            <p className="text-gold font-heading text-sm italic">{settings.site_tagline || 'Paint ♥ Create ♥ Be You'}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-ivory mb-6">🏠 Explore</h4>
            <ul className="space-y-3">
              {[
                { label: '🛍️ Shop', path: '/shop' },
                { label: '💎 Collections', path: '/collections' },
                { label: '🎨 Custom Creations', path: '/custom-creations' },
                { label: '📅 Book Appointment', path: '/book-appointment' },
                { label: '🐼 Our Story', path: '/our-story' },
                { label: '📸 Gallery', path: '/gallery' },
              ].map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-ivory/50 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-ivory mb-6">💌 Customer Care</h4>
            <ul className="space-y-3">
              {[
                { label: '💬 Contact Us', path: '/contact' },
                { label: '🎁 Custom Orders', path: '/custom-creations' },
                { label: '🚚 Shipping Info', path: '/contact' },
                { label: '📦 Returns', path: '/contact' },
                { label: '⭐ Reviews', path: '/gallery' },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm text-ivory/50 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-ivory mb-6">📍 Get in Touch</h4>
            <ul className="space-y-4">
              {settings.whatsapp && (
                <li className="flex items-center gap-3">
                  <span className="text-gold">💬</span>
                  <a 
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-ivory/50 hover:text-gold transition-colors"
                  >
                    {settings.whatsapp}
                  </a>
                </li>
              )}
              {settings.instagram_url && (
                <li className="flex items-center gap-3">
                  <span className="text-gold">📱</span>
                  <a 
                    href={settings.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-ivory/50 hover:text-gold transition-colors"
                  >
                    {settings.instagram_handle || 'Instagram'}
                  </a>
                </li>
              )}
              {settings.pinterest_url && (
                <li className="flex items-center gap-3">
                  <span className="text-gold">📌</span>
                  <a 
                    href={settings.pinterest_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-ivory/50 hover:text-gold transition-colors"
                  >
                    Pinterest
                  </a>
                </li>
              )}
              {!settings.whatsapp && !settings.instagram_url && !settings.pinterest_url && (
                <li className="text-sm text-ivory/50">
                  Contact information not available
                </li>
              )}
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-xs font-label tracking-wider uppercase text-ivory/50 mb-3">💌 Stay Inspired</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-ivory/10 border border-ivory/20 text-ivory text-sm rounded-l-sm focus:outline-none focus:border-gold placeholder:text-ivory/30"
                />
                <button className="px-4 py-2 bg-gold text-chocolate text-xs font-label tracking-wider uppercase rounded-r-sm hover:bg-gold/80 transition-colors font-medium">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-ivory/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory/30">
            {settings.copyright_text || `© ${new Date().getFullYear()} ${settings.site_name} | Fabric Art. All rights reserved.`}
          </p>
          <div className="flex items-center gap-6">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-ivory/30 hover:text-gold transition-colors text-lg">
                📱
              </a>
            )}
            {settings.whatsapp && (
              <a 
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-ivory/30 hover:text-gold transition-colors text-lg"
              >
                💬
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-ivory/30 hover:text-gold transition-colors text-lg">
                📘
              </a>
            )}
            {settings.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-ivory/30 hover:text-gold transition-colors text-lg">
                📺
              </a>
            )}
            {settings.pinterest_url && (
              <a href={settings.pinterest_url} target="_blank" rel="noopener noreferrer" className="text-ivory/30 hover:text-gold transition-colors text-lg">
                📌
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
