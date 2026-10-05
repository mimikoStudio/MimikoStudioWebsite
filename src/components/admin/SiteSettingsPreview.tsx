import { useSiteSettings } from '../../context/SiteSettingsContext';
import { SiteSettings } from '../../types/siteSettings';

interface SiteSettingsPreviewProps {
  settings: SiteSettings;
}

export default function SiteSettingsPreview({ settings }: SiteSettingsPreviewProps) {
  return (
    <div className="bg-pearl border border-beige/20 rounded-sm p-6">
      <h3 className="font-heading text-xl text-chocolate mb-4">🔍 Live Preview</h3>
      
      {/* Preview Container */}
      <div 
        className="border border-beige/30 rounded-sm overflow-hidden"
        style={{
          backgroundColor: settings.background_color,
          color: settings.text_color,
          fontFamily: settings.font_body,
          fontSize: settings.font_size_base,
          fontWeight: settings.body_weight,
          letterSpacing: settings.letter_spacing,
        }}
      >
        {/* Header Preview */}
        <header 
          className="p-4 border-b"
          style={{
            backgroundColor: settings.header_background_color,
            borderColor: settings.border_color,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.site_name}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: settings.accent_color + '20' }}>
                  <span className="text-xl">🎨</span>
                </div>
              )}
              <div>
                <h1 
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: settings.font_heading,
                    fontWeight: settings.heading_weight,
                    color: settings.heading_color,
                  }}
                >
                  {settings.site_name}
                </h1>
                <p className="text-xs" style={{ color: settings.primary_color }}>
                  {settings.site_tagline}
                </p>
              </div>
            </div>
            <nav className="hidden md:flex gap-4 text-sm">
              <span style={{ color: settings.text_color }}>Home</span>
              <span style={{ color: settings.text_color }}>Shop</span>
              <span style={{ color: settings.text_color }}>Contact</span>
            </nav>
          </div>
        </header>

        {/* Hero Preview */}
        {settings.show_hero_section && (
          <section 
            className="p-8 text-center"
            style={{
              backgroundImage: settings.hero_background_url ? `url(${settings.hero_background_url})` : 'none',
              backgroundColor: settings.secondary_color + '10',
            }}
          >
            <h2 
              className="text-2xl mb-2"
              style={{
                fontFamily: settings.font_heading,
                fontWeight: settings.heading_weight,
                color: settings.heading_color,
              }}
            >
              {settings.hero_title}
            </h2>
            <p className="text-sm mb-4" style={{ color: settings.muted_text_color }}>
              {settings.hero_subtitle}
            </p>
            <button
              className="px-6 py-2 rounded-sm text-sm font-medium transition-colors"
              style={{
                backgroundColor: settings.button_color,
                color: settings.background_color,
                fontFamily: settings.font_button,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = settings.button_hover_color;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = settings.button_color;
              }}
            >
              {settings.hero_primary_button_text}
            </button>
          </section>
        )}

        {/* Product Card Preview */}
        <section className="p-6">
          <h3 
            className="text-lg mb-4"
            style={{
              fontFamily: settings.font_heading,
              color: settings.heading_color,
            }}
          >
            Featured Products
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div 
                key={i}
                className="border rounded-sm overflow-hidden"
                style={{
                  backgroundColor: settings.card_background_color,
                  borderColor: settings.border_color,
                }}
              >
                <div 
                  className="aspect-square flex items-center justify-center"
                  style={{ backgroundColor: settings.accent_color + '10' }}
                >
                  <span className="text-4xl">📦</span>
                </div>
                <div className="p-3">
                  <h4 
                    className="text-sm font-medium mb-1"
                    style={{ color: settings.heading_color }}
                  >
                    Sample Product {i}
                  </h4>
                  <p 
                    className="text-lg font-medium"
                    style={{ color: settings.primary_color }}
                  >
                    ₹999
                  </p>
                  <button
                    className="w-full mt-2 py-2 rounded-sm text-xs font-medium"
                    style={{
                      backgroundColor: settings.button_color,
                      color: settings.background_color,
                      fontFamily: settings.font_button,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Preview */}
        <footer 
          className="p-6 text-center text-sm"
          style={{
            backgroundColor: settings.footer_background_color,
            color: settings.background_color,
          }}
        >
          <p>{settings.copyright_text}</p>
          {settings.show_footer_social && (
            <div className="flex justify-center gap-4 mt-3">
              {settings.instagram_url && <span>📷 Instagram</span>}
              {settings.facebook_url && <span>📘 Facebook</span>}
              {settings.whatsapp && <span>💬 WhatsApp</span>}
            </div>
          )}
        </footer>
      </div>

      {/* Color Palette Preview */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-chocolate mb-3">Color Palette</h4>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Primary', color: settings.primary_color },
            { label: 'Secondary', color: settings.secondary_color },
            { label: 'Accent', color: settings.accent_color },
            { label: 'Background', color: settings.background_color },
            { label: 'Text', color: settings.text_color },
            { label: 'Heading', color: settings.heading_color },
            { label: 'Button', color: settings.button_color },
            { label: 'Border', color: settings.border_color },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div 
                className="w-full h-12 rounded-sm border border-beige/30 mb-1"
                style={{ backgroundColor: item.color }}
              />
              <p className="text-xs text-coffee/60">{item.label}</p>
              <p className="text-xs text-coffee/40 font-mono">{item.color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Preview */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-chocolate mb-3">Typography</h4>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-coffee/60 mb-1">Heading Font: {settings.font_heading}</p>
            <p 
              className="text-2xl"
              style={{
                fontFamily: settings.font_heading,
                fontWeight: settings.heading_weight,
                color: settings.heading_color,
              }}
            >
              The Quick Brown Fox
            </p>
          </div>
          <div>
            <p className="text-xs text-coffee/60 mb-1">Body Font: {settings.font_body}</p>
            <p 
              style={{
                fontFamily: settings.font_body,
                fontWeight: settings.body_weight,
                color: settings.text_color,
                letterSpacing: settings.letter_spacing,
              }}
            >
              The quick brown fox jumps over the lazy dog. This is how body text will appear on your website.
            </p>
          </div>
          <div>
            <p className="text-xs text-coffee/60 mb-1">Button Font: {settings.font_button}</p>
            <button
              className="px-6 py-2 rounded-sm text-sm font-medium"
              style={{
                backgroundColor: settings.button_color,
                color: settings.background_color,
                fontFamily: settings.font_button,
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
