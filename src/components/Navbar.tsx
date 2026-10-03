import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, Search, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Collections', path: '/collections' },
  { label: 'Shop', path: '/shop' },
  { label: 'Custom Creations', path: '/custom-creations' },
  { label: 'Book Appointment', path: '/book-appointment' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';
  const navBg = isScrolled || !isHome
    ? 'bg-pearl/95 nav-glass shadow-sm'
    : 'bg-transparent';
  const textColor = isScrolled || !isHome ? 'text-espresso' : 'text-pearl';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-champagne/20 flex items-center justify-center">
              <span className="text-lg" role="img" aria-label="Mimiko">🎨</span>
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-heading text-xl font-semibold tracking-wide ${textColor}`}>
                Mimiko Studio
              </h1>
              <p className={`text-[10px] tracking-[0.2em] uppercase ${isScrolled || !isHome ? 'text-champagne' : 'text-champagne-light'}`}>
                Fabric Art
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-label tracking-[0.1em] uppercase transition-colors duration-300 hover:text-champagne ${textColor} ${
                  location.pathname === link.path ? 'text-champagne' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className={`hidden sm:block transition-colors hover:text-champagne ${textColor}`} aria-label="Search">
              <Search size={18} />
            </button>
            <Link to="/shop" className={`hidden sm:block transition-colors hover:text-champagne ${textColor}`} aria-label="Wishlist">
              <Heart size={18} />
            </Link>
            <Link to="/shop" className={`relative transition-colors hover:text-champagne ${textColor}`} aria-label="Shopping bag">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-champagne text-pearl text-[9px] rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link to="/admin/login" className={`hidden sm:block transition-colors hover:text-champagne ${textColor}`} aria-label="Account">
              <User size={18} />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden transition-colors ${textColor}`}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-pearl border-t border-beige/30 animate-fade-in">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block text-sm font-label tracking-[0.1em] uppercase py-2 border-b border-beige/20 transition-colors hover:text-champagne ${textColor} ${
                  location.pathname === link.path ? 'text-champagne' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
