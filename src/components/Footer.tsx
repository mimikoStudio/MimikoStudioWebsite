import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { INSTAGRAM_URL, WHATSAPP_URL } from '../lib/supabase';

export default function Footer() {
  return (
    <footer className="bg-espresso text-pearl/80">
      <div className="gold-divider-thick" />
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-champagne/20 flex items-center justify-center">
                <span className="text-xl" role="img" aria-label="Mimiko">🎨</span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-pearl">Mimiko Studio</h3>
                <p className="text-[10px] tracking-[0.2em] uppercase text-champagne">Fabric Art</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-pearl/60 mb-6">
              Handcrafted fabric art, thoughtfully painted and uniquely designed for you. Each piece tells a story of creativity and passion.
            </p>
            <p className="text-xs tracking-wider text-champagne font-label">Paint ♥ Create ♥ Be You</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-pearl mb-6">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: 'Collections', path: '/collections' },
                { label: 'Shop', path: '/shop' },
                { label: 'Custom Creations', path: '/custom-creations' },
                { label: 'Book Appointment', path: '/book-appointment' },
                { label: 'Our Story', path: '/our-story' },
                { label: 'Gallery', path: '/gallery' },
              ].map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-pearl/60 hover:text-champagne transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-pearl mb-6">Customer Care</h4>
            <ul className="space-y-3">
              {[
                { label: 'Contact Us', path: '/contact' },
                { label: 'Custom Orders', path: '/custom-creations' },
                { label: 'Shipping Info', path: '/contact' },
                { label: 'Returns & Exchanges', path: '/contact' },
                { label: 'FAQ', path: '/contact' },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm text-pearl/60 hover:text-champagne transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-pearl mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-champagne flex-shrink-0" />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-pearl/60 hover:text-champagne transition-colors">
                  +91 7874291924
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram size={14} className="text-champagne flex-shrink-0" />
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-pearl/60 hover:text-champagne transition-colors">
                  @mimiko.studio24
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-champagne flex-shrink-0" />
                <span className="text-sm text-pearl/60">hello@mimikostudio.com</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-xs font-label tracking-wider uppercase text-pearl/60 mb-3">Stay Inspired</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-pearl/10 border border-pearl/20 text-pearl text-sm rounded-l-sm focus:outline-none focus:border-champagne placeholder:text-pearl/30"
                />
                <button className="px-4 py-2 bg-champagne text-pearl text-xs font-label tracking-wider uppercase rounded-r-sm hover:bg-champagne/80 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-pearl/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-pearl/40">
            © {new Date().getFullYear()} Mimiko Studio | Fabric Art. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-pearl/40 hover:text-champagne transition-colors">
              <Instagram size={16} />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-pearl/40 hover:text-champagne transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
