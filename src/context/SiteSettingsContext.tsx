import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings, defaultSiteSettings } from '../types/siteSettings';

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ success: boolean; message: string }>;
  resetSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const settingsMap: any = {};
        data.forEach((item: any) => {
          // Try to parse JSON values
          try {
            settingsMap[item.setting_key] = JSON.parse(item.setting_value);
          } catch {
            settingsMap[item.setting_key] = item.setting_value;
          }
        });
        setSettings({ ...defaultSiteSettings, ...settingsMap });
      }
    } catch (error) {
      // Error loading site settings handled silently
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
      
      // Save each setting to database
      const updates = Object.entries(updatedSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) {
          console.error('Failed to save setting:', {
            key: update.setting_key,
            error: error.message,
            details: error.details,
            hint: error.hint
          });
          throw new Error(`Failed to save setting "${update.setting_key}": ${error.message}`);
        }
      }

      // Update local state
      setSettings(updatedSettings);
      
      // Apply theme to document
      applyTheme(updatedSettings);
      
      // Invalidate browser cache for this session
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Force reload of images by adding timestamp to URLs
      const timestamp = Date.now();
      document.querySelectorAll('img[data-site-image]').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.includes('timestamp=')) {
          img.setAttribute('src', `${src}${src.includes('?') ? '&' : '?'}timestamp=${timestamp}`);
        }
      });
      
      return { success: true, message: 'Settings saved successfully' };
    } catch (error: any) {
      console.error('Error updating settings:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      await updateSettings(defaultSiteSettings);
      setSettings(defaultSiteSettings);
      applyTheme(defaultSiteSettings);
    } catch (error) {
      throw error;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  // Apply theme settings to document
  const applyTheme = (themeSettings: SiteSettings) => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--color-primary', themeSettings.primary_color);
    root.style.setProperty('--color-secondary', themeSettings.secondary_color);
    root.style.setProperty('--color-accent', themeSettings.accent_color);
    root.style.setProperty('--color-background', themeSettings.background_color);
    root.style.setProperty('--color-card-bg', themeSettings.card_background_color);
    root.style.setProperty('--color-text', themeSettings.text_color);
    root.style.setProperty('--color-heading', themeSettings.heading_color);
    root.style.setProperty('--color-muted', themeSettings.muted_text_color);
    root.style.setProperty('--color-border', themeSettings.border_color);
    root.style.setProperty('--color-button', themeSettings.button_color);
    root.style.setProperty('--color-button-hover', themeSettings.button_hover_color);
    
    // Apply fonts
    root.style.setProperty('--font-heading', themeSettings.font_heading);
    root.style.setProperty('--font-body', themeSettings.font_body);
    root.style.setProperty('--font-button', themeSettings.font_button);
    root.style.setProperty('--font-size-base', themeSettings.font_size_base);
    root.style.setProperty('--font-weight-heading', themeSettings.heading_weight);
    root.style.setProperty('--font-weight-body', themeSettings.body_weight);
    root.style.setProperty('--letter-spacing', themeSettings.letter_spacing);
  };

  // Apply theme on initial load
  useEffect(() => {
    if (!loading) {
      applyTheme(settings);
    }
  }, [loading, settings]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        resetSettings,
        refreshSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
}
