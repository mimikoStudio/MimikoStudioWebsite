import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    site_name: 'Mimiko Studio',
    site_tagline: 'Paint ♥ Create ♥ Be You',
    whatsapp_number: '+917874291924',
    instagram_handle: '@mimiko.studio24',
    instagram_url: 'https://www.instagram.com/mimiko.studio24/',
    shipping_fee: '99',
    free_shipping_minimum: '1999',
    currency: 'INR',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap: any = {};
        data.forEach((item: any) => {
          settingsMap[item.setting_key] = item.setting_value;
        });
        setSettings({ ...settings, ...settingsMap });
      }
    } catch (error) {
      // Error fetching settings handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('❌ Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">⚙️ Site Settings</h2>
      </div>

      <div className="bg-pearl border border-beige/20 rounded-sm p-6 space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
            General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
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
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                className="input-luxury"
              />
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div>
          <h3 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
            Contact & Social Media
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={settings.instagram_handle}
                onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="input-luxury"
              />
            </div>
          </div>
        </div>

        {/* E-commerce Settings */}
        <div>
          <h3 className="font-label text-sm tracking-wider uppercase text-gold mb-4">
            E-commerce Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="select-luxury"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Shipping Fee ({settings.currency})
              </label>
              <input
                type="number"
                value={settings.shipping_fee}
                onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Free Shipping Minimum ({settings.currency})
              </label>
              <input
                type="number"
                value={settings.free_shipping_minimum}
                onChange={(e) => setSettings({ ...settings, free_shipping_minimum: e.target.value })}
                className="input-luxury"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-beige/20">
          {message && (
            <div className={`mb-4 p-3 rounded-sm text-sm ${
              message.includes('✅') ? 'bg-sage/10 text-sage' : 'bg-blush/10 text-blush'
            }`}>
              {message}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
