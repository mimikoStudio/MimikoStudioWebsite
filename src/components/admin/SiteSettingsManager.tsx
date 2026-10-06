import { useState, useEffect } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { supabase } from '../../lib/supabase';
import { 
  Palette, Type, Image, Layout, Navigation, Share2, 
  Phone, MessageSquare, ShoppingBag, Save, RotateCcw, Eye,
  Upload, Check, X, AlertCircle
} from 'lucide-react';
import SiteSettingsPreview from './SiteSettingsPreview';

type SettingsTab = 'branding' | 'theme' | 'typography' | 'homepage' | 'header' | 'footer' | 'social' | 'contact' | 'ecommerce' | 'inquiry' | 'preview';

export default function SiteSettingsManager() {
  const { settings, loading, updateSettings, resetSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await updateSettings(localSettings);
      setMessage({ 
        type: 'success', 
        text: '✅ ' + result.message + ' Click "Reload Website" to see all changes.' 
      });
      setHasChanges(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: '❌ Error saving settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReloadWebsite = () => {
    // Force a hard reload to apply all settings
    window.location.reload();
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) return;
    
    setSaving(true);
    try {
      await resetSettings();
      setMessage({ type: 'success', text: '✅ Settings reset to default!' });
      setHasChanges(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: '❌ Error resetting settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (key: string, file: File) => {
    try {
      setMessage({ type: 'success', text: '📤 Uploading image...' });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${key}/${Date.now()}.${fileExt}`;
      
      // Try website-content bucket first
      let uploadError: any = null;
      let publicUrl = '';
      
      try {
        const { error } = await supabase.storage
          .from('website-content')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });
        
        if (error) {
          uploadError = error;
        } else {
          const { data: { publicUrl: url } } = supabase.storage
            .from('website-content')
            .getPublicUrl(fileName);
          publicUrl = url;
        }
      } catch (err: any) {
        uploadError = err;
      }
      
      // If website-content fails, try product-images bucket
      if (uploadError) {
        console.log('website-content bucket failed, trying product-images...');
        try {
          const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
            });
          
          if (error) {
            uploadError = error;
          } else {
            const { data: { publicUrl: url } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);
            publicUrl = url;
            uploadError = null;
          }
        } catch (err: any) {
          uploadError = err;
        }
      }
      
      // If both buckets fail, convert to base64
      if (uploadError) {
        console.log('Both buckets failed, converting to base64...');
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          updateLocalSetting(key, base64);
          setMessage({ type: 'success', text: '✅ Image uploaded successfully (stored as base64)' });
        };
        reader.onerror = () => {
          setMessage({ type: 'error', text: '❌ Error uploading image: ' + uploadError.message });
        };
        reader.readAsDataURL(file);
        return;
      }
      
      // Save the public URL
      updateLocalSetting(key, publicUrl);
      setMessage({ type: 'success', text: '✅ Image uploaded successfully!' });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: '❌ Error uploading image: ' + error.message });
    }
  };

  // Type-safe wrapper for component callbacks
  const handleImageUploadTyped = (key: string) => (file: File) => {
    handleImageUpload(key, file);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  const tabs = [
    { id: 'branding' as SettingsTab, label: '🎨 Branding', icon: <Palette size={16} /> },
    { id: 'theme' as SettingsTab, label: '🎨 Theme', icon: <Palette size={16} /> },
    { id: 'typography' as SettingsTab, label: '✍️ Typography', icon: <Type size={16} /> },
    { id: 'homepage' as SettingsTab, label: '🏠 Homepage', icon: <Layout size={16} /> },
    { id: 'header' as SettingsTab, label: '🧭 Header', icon: <Navigation size={16} /> },
    { id: 'footer' as SettingsTab, label: '🦶 Footer', icon: <Layout size={16} /> },
    { id: 'social' as SettingsTab, label: '📱 Social', icon: <Share2 size={16} /> },
    { id: 'contact' as SettingsTab, label: '📞 Contact', icon: <Phone size={16} /> },
    { id: 'ecommerce' as SettingsTab, label: '🛍️ E-commerce', icon: <ShoppingBag size={16} /> },
    { id: 'inquiry' as SettingsTab, label: '💬 Inquiry', icon: <MessageSquare size={16} /> },
    { id: 'preview' as SettingsTab, label: '🔍 Preview', icon: <Eye size={16} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading text-chocolate">⚙️ Site Settings</h2>
          <p className="text-sm text-coffee/60 mt-1">Customize your website appearance and behavior</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="btn-outline flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {!hasChanges && (
            <button
              onClick={handleReloadWebsite}
              className="btn-secondary flex items-center gap-2"
            >
              🔄 Reload Website
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-sm border ${
          message.type === 'success' ? 'bg-sage/10 border-sage/20 text-sage' : 'bg-blush/10 border-blush/20 text-blush'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-pearl border border-beige/20 rounded-sm mb-6">
        <div className="flex overflow-x-auto border-b border-beige/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-gold border-b-2 border-gold bg-gold/5'
                  : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'branding' && <BrandingSettings settings={localSettings} onUpdate={updateLocalSetting} onImageUpload={handleImageUpload} />}
          {activeTab === 'theme' && <ThemeSettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'typography' && <TypographySettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'homepage' && <HomepageSettings settings={localSettings} onUpdate={updateLocalSetting} onImageUpload={handleImageUpload} />}
          {activeTab === 'header' && <HeaderSettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'footer' && <FooterSettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'social' && <SocialSettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'contact' && <ContactSettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'ecommerce' && <EcommerceSettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'inquiry' && <InquirySettings settings={localSettings} onUpdate={updateLocalSetting} />}
          {activeTab === 'preview' && <SiteSettingsPreview settings={localSettings} />}
        </div>
      </div>

      {/* Live Preview Indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-gold text-chocolate px-6 py-3 rounded-sm shadow-luxury-lg flex items-center gap-3 animate-fade-in">
          <Eye size={20} />
          <span className="text-sm font-medium">Live Preview Active</span>
        </div>
      )}
    </div>
  );
}

// Branding Settings Component
function BrandingSettings({ settings, onUpdate, onImageUpload }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🎨 Brand Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Website Logo
            </label>
            <ImageUploadField
              value={settings.logo_url}
              onChange={(file: File) => onImageUpload('logo_url', file)}
              placeholder="Upload logo"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Favicon
            </label>
            <ImageUploadField
              value={settings.favicon_url}
              onChange={(file: File) => onImageUpload('favicon_url', file)}
              placeholder="Upload favicon"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => onUpdate('site_name', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.site_tagline}
              onChange={(e) => onUpdate('site_tagline', e.target.value)}
              className="input-luxury"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Theme Settings Component
function ThemeSettings({ settings, onUpdate }: any) {
  const colorFields = [
    { key: 'primary_color', label: 'Primary Color' },
    { key: 'secondary_color', label: 'Secondary Color' },
    { key: 'accent_color', label: 'Accent Color' },
    { key: 'background_color', label: 'Background Color' },
    { key: 'card_background_color', label: 'Card Background' },
    { key: 'text_color', label: 'Text Color' },
    { key: 'heading_color', label: 'Heading Color' },
    { key: 'muted_text_color', label: 'Muted Text Color' },
    { key: 'border_color', label: 'Border Color' },
    { key: 'button_color', label: 'Button Color' },
    { key: 'button_hover_color', label: 'Button Hover Color' },
    { key: 'header_background_color', label: 'Header Background' },
    { key: 'footer_background_color', label: 'Footer Background' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🎨 Theme Colors</h3>
        <p className="text-sm text-coffee/60 mb-6">Customize the color palette of your website</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorFields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                {field.label}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings[field.key]}
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  className="w-12 h-10 rounded-sm border border-beige/30 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings[field.key]}
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  className="input-luxury flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Typography Settings Component
function TypographySettings({ settings, onUpdate }: any) {
  const fontOptions = [
    'Cormorant Garamond',
    'Playfair Display',
    'Inter',
    'Lato',
    'Montserrat',
    'Poppins',
    'Roboto',
    'Open Sans',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">✍️ Typography</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Heading Font
            </label>
            <select
              value={settings.font_heading}
              onChange={(e) => onUpdate('font_heading', e.target.value)}
              className="select-luxury"
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Body Font
            </label>
            <select
              value={settings.font_body}
              onChange={(e) => onUpdate('font_body', e.target.value)}
              className="select-luxury"
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Button Font
            </label>
            <select
              value={settings.font_button}
              onChange={(e) => onUpdate('font_button', e.target.value)}
              className="select-luxury"
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Base Font Size
            </label>
            <input
              type="text"
              value={settings.font_size_base}
              onChange={(e) => onUpdate('font_size_base', e.target.value)}
              className="input-luxury"
              placeholder="16px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Homepage Settings Component
function HomepageSettings({ settings, onUpdate, onImageUpload }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🏠 Hero Section</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.show_hero_section}
                onChange={(e) => onUpdate('show_hero_section', e.target.checked)}
                className="accent-gold"
              />
              <span className="text-sm text-coffee/70">Show Hero Section</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Hero Title
            </label>
            <input
              type="text"
              value={settings.hero_title}
              onChange={(e) => onUpdate('hero_title', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={settings.hero_subtitle}
              onChange={(e) => onUpdate('hero_subtitle', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Hero Description
            </label>
            <textarea
              value={settings.hero_description}
              onChange={(e) => onUpdate('hero_description', e.target.value)}
              className="textarea-luxury"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Primary Button Text
              </label>
              <input
                type="text"
                value={settings.hero_primary_button_text}
                onChange={(e) => onUpdate('hero_primary_button_text', e.target.value)}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Primary Button Link
              </label>
              <input
                type="text"
                value={settings.hero_primary_button_link}
                onChange={(e) => onUpdate('hero_primary_button_link', e.target.value)}
                className="input-luxury"
                placeholder="/collections"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header Settings Component
function HeaderSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🧭 Header Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_sticky_header}
              onChange={(e) => onUpdate('enable_sticky_header', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Enable Sticky Header</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.show_search}
              onChange={(e) => onUpdate('show_search', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Show Search Icon</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.show_wishlist}
              onChange={(e) => onUpdate('show_wishlist', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Show Wishlist Icon</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.show_cart}
              onChange={(e) => onUpdate('show_cart', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Show Cart Icon</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.show_login}
              onChange={(e) => onUpdate('show_login', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Show Login Icon</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// Footer Settings Component
function FooterSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🦶 Footer Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Footer About Text
            </label>
            <textarea
              value={settings.footer_about_text}
              onChange={(e) => onUpdate('footer_about_text', e.target.value)}
              className="textarea-luxury"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={settings.copyright_text}
              onChange={(e) => onUpdate('copyright_text', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.show_footer_quick_links}
                onChange={(e) => onUpdate('show_footer_quick_links', e.target.checked)}
                className="accent-gold"
              />
              <span className="text-sm text-coffee/70">Show Quick Links</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.show_footer_social}
                onChange={(e) => onUpdate('show_footer_social', e.target.checked)}
                className="accent-gold"
              />
              <span className="text-sm text-coffee/70">Show Social Media</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.show_footer_contact}
                onChange={(e) => onUpdate('show_footer_contact', e.target.checked)}
                className="accent-gold"
              />
              <span className="text-sm text-coffee/70">Show Contact Info</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Social Settings Component
function SocialSettings({ settings, onUpdate }: any) {
  const socialFields = [
    { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/...' },
    { key: 'pinterest_url', label: 'Pinterest', placeholder: 'https://pinterest.com/...' },
    { key: 'twitter_url', label: 'Twitter/X', placeholder: 'https://twitter.com/...' },
    { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">📱 Social Media</h3>
        <p className="text-sm text-coffee/60 mb-6">Add your social media profile URLs. Icons will only show for profiles with URLs.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialFields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                {field.label}
              </label>
              <input
                type="url"
                value={settings[field.key]}
                onChange={(e) => onUpdate(field.key, e.target.value)}
                className="input-luxury"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Contact Settings Component
function ContactSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">📞 Contact & Business</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={settings.business_name}
              onChange={(e) => onUpdate('business_name', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={settings.whatsapp}
              onChange={(e) => onUpdate('whatsapp', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => onUpdate('address', e.target.value)}
              className="textarea-luxury"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Business Hours
            </label>
            <input
              type="text"
              value={settings.business_hours}
              onChange={(e) => onUpdate('business_hours', e.target.value)}
              className="input-luxury"
              placeholder="Mon-Sat: 10 AM - 7 PM"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Google Maps URL
            </label>
            <input
              type="url"
              value={settings.google_maps_url}
              onChange={(e) => onUpdate('google_maps_url', e.target.value)}
              className="input-luxury"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_contact_form}
              onChange={(e) => onUpdate('enable_contact_form', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Enable Contact Form</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_whatsapp_button}
              onChange={(e) => onUpdate('enable_whatsapp_button', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Enable WhatsApp Button</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// E-commerce Settings Component
function EcommerceSettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🛍️ E-commerce Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => onUpdate('currency', e.target.value)}
              className="select-luxury"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Shipping Fee
            </label>
            <input
              type="number"
              value={settings.shipping_fee}
              onChange={(e) => onUpdate('shipping_fee', e.target.value)}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Free Shipping Minimum
            </label>
            <input
              type="number"
              value={settings.free_shipping_minimum}
              onChange={(e) => onUpdate('free_shipping_minimum', e.target.value)}
              className="input-luxury"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Inquiry Settings Component
function InquirySettings({ settings, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">💬 Inquiry & Booking Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_inquiries}
              onChange={(e) => onUpdate('enable_inquiries', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Enable Custom Inquiries</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_booking}
              onChange={(e) => onUpdate('enable_booking', e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-coffee/70">Enable Appointment Booking</span>
          </label>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Inquiry Success Message
            </label>
            <textarea
              value={settings.inquiry_success_message}
              onChange={(e) => onUpdate('inquiry_success_message', e.target.value)}
              className="textarea-luxury"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Booking Success Message
            </label>
            <textarea
              value={settings.booking_success_message}
              onChange={(e) => onUpdate('booking_success_message', e.target.value)}
              className="textarea-luxury"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Booking Notice
            </label>
            <input
              type="text"
              value={settings.booking_notice}
              onChange={(e) => onUpdate('booking_notice', e.target.value)}
              className="input-luxury"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Image Upload Field Component
function ImageUploadField({ value, onChange, placeholder }: any) {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      await onChange(file);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {preview && (
        <div className="relative w-32 h-32 border border-beige/30 rounded-sm overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-chocolate/50 flex items-center justify-center">
              <div className="spinner-luxury" />
            </div>
          )}
        </div>
      )}
      <label className="block">
        <div className="border-2 border-dashed border-beige hover:border-gold rounded-sm p-4 text-center cursor-pointer transition-colors">
          {uploading ? (
            <div className="spinner-luxury mx-auto" />
          ) : (
            <>
              <Upload size={24} className="mx-auto text-gold mb-2" />
              <p className="text-xs text-coffee/60">{placeholder || 'Click to upload'}</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
