import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const navLinks = [
  { label: '🏠 Home', path: '/' },
  { label: '🛍️ Shop', path: '/shop' },
  { label: '🎨 Custom Creations', path: '/custom-creations' },
  { label: '💎 Signature Collections', path: '/signature-collections' },
  { label: '📅 Book Appointment', path: '/book-appointment' },
  { label: '🐼 Our Story', path: '/our-story' },
  { label: '📸 Gallery', path: '/gallery' },
  { label: '💌 Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { settings } = useSiteSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('🎨 Navbar: Settings updated, re-rendering...');
      // Force re-render by updating state
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  const isHome = location.pathname === '/';
  const isSolid = isScrolled || !isHome;
  const navBg = isSolid ? 'bg-ivory/95 nav-glass shadow-luxury' : 'bg-transparent';
  const textColor = isSolid ? 'text-chocolate' : 'text-white';
  const accentColor = isSolid ? 'text-gold' : 'text-champagne-light';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.site_name}
                className="h-11 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-11 h-11 rounded-full bg-gradient-to-br from-cream to-beige/50 flex items-center justify-center border border-gold/20';
                    fallback.innerHTML = '<span class="text-xl" role="img" aria-label="Mimiko Studio">🎨</span>';
                    parent.insertBefore(fallback, parent.firstChild);
                  }
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cream to-beige/50 flex items-center justify-center border border-gold/20 group-hover:border-gold/40 transition-all shadow-sm">
                <span className="text-xl" role="img" aria-label="Mimiko Studio">🎨</span>
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className={`font-heading text-xl font-semibold tracking-wide ${textColor}`}>
                {settings.site_name}
              </h1>
              <p className={`text-[10px] tracking-[0.25em] uppercase ${accentColor}`}>
                {settings.site_tagline || 'Fabric Art'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-xs font-label tracking-[0.08em] transition-colors duration-300 hover:text-gold ${textColor} ${
                  location.pathname === link.path ? 'text-gold' : ''
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gold/10 ${textColor}`} aria-label="Search">
              <Search size={16} />
            </button>
            <Link to="/shop" className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gold/10 ${textColor}`} aria-label="Wishlist">
              <Heart size={16} />
            </Link>
            <Link to="/cart" className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gold/10 ${textColor}`} aria-label="Shopping bag">
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blush text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/admin/login" className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-gold/10 ${textColor}`} aria-label="Account">
              <User size={16} />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className={`xl:hidden flex items-center justify-center w-9 h-9 rounded-full transition-all ${textColor}`}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="xl:hidden bg-ivory border-t border-beige/30 animate-fade-in shadow-luxury-lg">
          <div className="px-4 py-6 space-y-1 max-h-[80vh] overflow-y-auto">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block text-sm font-label tracking-[0.08em] py-3 px-4 rounded-sm border-b border-cream/50 transition-all hover:bg-cream/50 hover:text-gold ${textColor} ${
                  location.pathname === link.path ? 'text-gold bg-cream/30' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex items-center gap-4 px-4">
              <Link to="/admin/login" className="text-xs text-coffee/60 hover:text-gold transition-colors">
                👤 Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
