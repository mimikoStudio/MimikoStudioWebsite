import { useState, useEffect } from 'react';
import { Palette, Calendar, Image as ImageIcon, Clock, Eye, Edit, Trash2, Plus, Save, X, Check } from 'lucide-react';
import { 
  getAllThemePresets, 
  createThemePreset, 
  updateThemePreset, 
  deleteThemePreset,
  activateThemePreset,
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  scheduleCampaign,
  activateCampaign,
  getCampaignBanners,
  createCampaignBanner,
  updateCampaignBanner,
  deleteCampaignBanner,
  getThemeRevisions,
  restoreThemeRevision,
  applyThemeToDocument
} from '../../lib/festivalThemeService';
import type { ThemePreset, FestivalCampaign, CampaignBanner, ThemeRevision, ThemeConfig } from '../../types/festivalTheme';
import { useI18n } from '../../i18n/I18nContext';

type Tab = 'themes' | 'campaigns' | 'banners' | 'revisions';

export default function FestivalThemeManager() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('themes');
  const [themes, setThemes] = useState<ThemePreset[]>([]);
  const [campaigns, setCampaigns] = useState<FestivalCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<FestivalCampaign | null>(null);
  const [banners, setBanners] = useState<CampaignBanner[]>([]);
  const [revisions, setRevisions] = useState<ThemeRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCampaign]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'themes') {
        const data = await getAllThemePresets();
        setThemes(data);
      } else if (activeTab === 'campaigns') {
        const data = await getAllCampaigns();
        setCampaigns(data);
      } else if (activeTab === 'banners' && selectedCampaign) {
        const data = await getCampaignBanners(selectedCampaign.id);
        setBanners(data);
      } else if (activeTab === 'revisions') {
        // Load revisions for all themes
        const allRevisions: ThemeRevision[] = [];
        for (const theme of themes) {
          const themeRevisions = await getThemeRevisions(theme.id);
          allRevisions.push(...themeRevisions);
        }
        setRevisions(allRevisions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    const result = await activateThemePreset(themeId);
    if (result.success) {
      alert('✅ Theme activated successfully!');
      loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    const result = await deleteThemePreset(themeId);
    if (result.success) {
      alert('✅ Theme deleted successfully!');
      loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    const result = await deleteCampaign(campaignId);
    if (result.success) {
      alert('✅ Campaign deleted successfully!');
      loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    const result = await deleteCampaignBanner(bannerId);
    if (result.success) {
      alert('✅ Banner deleted successfully!');
      loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!confirm('Are you sure you want to restore this revision? This will overwrite the current theme configuration.')) return;
    
    const result = await restoreThemeRevision(revisionId);
    if (result.success) {
      alert('✅ Revision restored successfully!');
      loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner-luxury" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">🎨 Festival & Theme Studio</h2>
      </div>

      {/* Tabs */}
      <div className="bg-pearl border border-beige/20 rounded-sm mb-6">
        <div className="flex overflow-x-auto border-b border-beige/20">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'themes'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <Palette size={16} />
            Theme Presets
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'campaigns'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <Calendar size={16} />
            Campaigns
          </button>
          <button
            onClick={() => {
              if (campaigns.length > 0 && !selectedCampaign) {
                setSelectedCampaign(campaigns[0]);
              }
              setActiveTab('banners');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'banners'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <ImageIcon size={16} />
            Banners
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'revisions'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <Clock size={16} />
            Revisions
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'themes' && (
            <ThemesTab
              themes={themes}
              onActivate={handleActivateTheme}
              onDelete={handleDeleteTheme}
              onEdit={(theme: ThemePreset) => {
                setEditingItem(theme);
                setShowForm(true);
              }}
              onCreate={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
            />
          )}
          {activeTab === 'campaigns' && (
            <CampaignsTab
              campaigns={campaigns}
              themes={themes}
              onDelete={handleDeleteCampaign}
              onEdit={(campaign: FestivalCampaign) => {
                setEditingItem(campaign);
                setShowForm(true);
              }}
              onCreate={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              onSelect={(campaign: FestivalCampaign) => {
                setSelectedCampaign(campaign);
                setActiveTab('banners');
              }}
            />
          )}
          {activeTab === 'banners' && (
            <BannersTab
              campaigns={campaigns}
              selectedCampaign={selectedCampaign}
              banners={banners}
              onSelectCampaign={(campaign: FestivalCampaign) => setSelectedCampaign(campaign)}
              onDelete={handleDeleteBanner}
              onEdit={(banner: CampaignBanner) => {
                setEditingItem(banner);
                setShowForm(true);
              }}
              onCreate={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
            />
          )}
          {activeTab === 'revisions' && (
            <RevisionsTab
              revisions={revisions}
              themes={themes}
              onRestore={handleRestoreRevision}
            />
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ThemeFormModal
          item={editingItem}
          type={activeTab === 'banners' ? 'banner' : activeTab === 'campaigns' ? 'campaign' : 'theme'}
          themes={themes}
          campaigns={campaigns}
          selectedCampaign={selectedCampaign}
          onSave={async (data: any) => {
            let result;
            if (activeTab === 'themes') {
              if (editingItem) {
                result = await updateThemePreset(editingItem.id, data);
              } else {
                result = await createThemePreset(data);
              }
            } else if (activeTab === 'campaigns') {
              if (editingItem) {
                result = await updateCampaign(editingItem.id, data);
              } else {
                result = await createCampaign(data);
              }
            } else if (activeTab === 'banners') {
              if (editingItem) {
                result = await updateCampaignBanner(editingItem.id, data);
              } else {
                result = await createCampaignBanner({ ...data, campaign_id: selectedCampaign?.id });
              }
            }

            if (result?.success) {
              alert('✅ Saved successfully!');
              setShowForm(false);
              setEditingItem(null);
              loadData();
            } else {
              alert(`❌ Error: ${result?.error}`);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// Themes Tab Component
function ThemesTab({ themes, onActivate, onDelete, onEdit, onCreate }: any) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Theme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme: ThemePreset) => (
          <div key={theme.id} className="bg-pearl border border-beige/20 rounded-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg text-chocolate">{theme.name}</h3>
                <p className="text-xs text-coffee/50">{theme.preset_type}</p>
              </div>
              <div className="flex gap-2">
                {theme.is_active && (
                  <span className="badge-luxury bg-sage/10 text-sage">Active</span>
                )}
                {theme.is_default && (
                  <span className="badge-luxury bg-gold/10 text-gold">Default</span>
                )}
              </div>
            </div>

            {theme.description && (
              <p className="text-sm text-coffee/60 mb-4">{theme.description}</p>
            )}

            {/* Color Preview */}
            <div className="flex gap-2 mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: theme.config.primary_color }} />
              <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: theme.config.secondary_color }} />
              <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: theme.config.accent_color }} />
              <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: theme.config.background_color }} />
            </div>

            <div className="flex gap-2">
              {!theme.is_active && (
                <button onClick={() => onActivate(theme.id)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <Check size={14} /> Activate
                </button>
              )}
              <button onClick={() => onEdit(theme)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                <Edit size={14} /> Edit
              </button>
              {!theme.is_default && (
                <button onClick={() => onDelete(theme.id)} className="btn-outline flex items-center justify-center gap-2">
                  <Trash2 size={14} className="text-blush" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No theme presets yet. Click "Create Theme" to add one.</p>
        </div>
      )}
    </div>
  );
}

// Campaigns Tab Component
function CampaignsTab({ campaigns, themes, onDelete, onEdit, onCreate, onSelect }: any) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign: FestivalCampaign) => (
          <div key={campaign.id} className="bg-pearl border border-beige/20 rounded-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg text-chocolate">{campaign.name}</h3>
                <p className="text-xs text-coffee/50">
                  Status: <span className={`font-medium ${
                    campaign.status === 'active' ? 'text-sage' :
                    campaign.status === 'scheduled' ? 'text-gold' :
                    campaign.status === 'expired' ? 'text-blush' :
                    'text-coffee/60'
                  }`}>{campaign.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onSelect(campaign)} className="btn-outline flex items-center gap-2">
                  <Eye size={14} /> View Banners
                </button>
                <button onClick={() => onEdit(campaign)} className="btn-outline flex items-center gap-2">
                  <Edit size={14} />
                </button>
                <button onClick={() => onDelete(campaign.id)} className="btn-outline flex items-center gap-2">
                  <Trash2 size={14} className="text-blush" />
                </button>
              </div>
            </div>

            {campaign.description && (
              <p className="text-sm text-coffee/60 mb-4">{campaign.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-coffee/50">Theme</p>
                <p className="text-chocolate font-medium">{campaign.theme_preset?.name || 'None'}</p>
              </div>
              <div>
                <p className="text-coffee/50">Start Date</p>
                <p className="text-chocolate font-medium">
                  {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-coffee/50">End Date</p>
                <p className="text-chocolate font-medium">
                  {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-coffee/50">Priority</p>
                <p className="text-chocolate font-medium">{campaign.priority}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No campaigns yet. Click "Create Campaign" to add one.</p>
        </div>
      )}
    </div>
  );
}

// Banners Tab Component
function BannersTab({ campaigns, selectedCampaign, banners, onSelectCampaign, onDelete, onEdit, onCreate }: any) {
  return (
    <div>
      <div className="mb-4">
        <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
          Select Campaign
        </label>
        <select
          value={selectedCampaign?.id || ''}
          onChange={(e) => {
            const campaign = campaigns.find((c: FestivalCampaign) => c.id === e.target.value);
            onSelectCampaign(campaign);
          }}
          className="select-luxury"
        >
          <option value="">Select a campaign...</option>
          {campaigns.map((campaign: FestivalCampaign) => (
            <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
          ))}
        </select>
      </div>

      {selectedCampaign && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={onCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Banner
            </button>
          </div>

          <div className="space-y-4">
            {banners.map((banner: CampaignBanner) => (
              <div key={banner.id} className="bg-pearl border border-beige/20 rounded-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-lg text-chocolate">{banner.title_en || 'Untitled'}</h3>
                    <p className="text-xs text-coffee/50">Order: {banner.display_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(banner)} className="btn-outline flex items-center gap-2">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onDelete(banner.id)} className="btn-outline flex items-center gap-2">
                      <Trash2 size={14} className="text-blush" />
                    </button>
                  </div>
                </div>

                {banner.desktop_image_url && (
                  <div className="aspect-video mb-4 rounded-sm overflow-hidden">
                    <img src={banner.desktop_image_url} alt={banner.title_en} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-coffee/50">Title (EN)</p>
                    <p className="text-chocolate">{banner.title_en || '-'}</p>
                  </div>
                  <div>
                    <p className="text-coffee/50">Title (HI)</p>
                    <p className="text-chocolate">{banner.title_hi || '-'}</p>
                  </div>
                  <div>
                    <p className="text-coffee/50">Title (GU)</p>
                    <p className="text-chocolate">{banner.title_gu || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {banners.length === 0 && (
            <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
              <p className="text-coffee/40">No banners for this campaign yet. Click "Add Banner" to create one.</p>
            </div>
          )}
        </>
      )}

      {!selectedCampaign && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">Select a campaign to manage its banners.</p>
        </div>
      )}
    </div>
  );
}

// Revisions Tab Component
function RevisionsTab({ revisions, themes, onRestore }: any) {
  return (
    <div>
      <div className="space-y-4">
        {revisions.map((revision: ThemeRevision) => {
          const theme = themes.find((t: ThemePreset) => t.id === revision.theme_preset_id);
          return (
            <div key={revision.id} className="bg-pearl border border-beige/20 rounded-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg text-chocolate">{theme?.name || 'Unknown Theme'}</h3>
                  <p className="text-xs text-coffee/50">Revision #{revision.revision_number}</p>
                  <p className="text-xs text-coffee/50">{new Date(revision.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => onRestore(revision.id)} className="btn-outline flex items-center gap-2">
                  <Clock size={14} /> Restore
                </button>
              </div>

              {revision.notes && (
                <p className="text-sm text-coffee/60 mb-4">{revision.notes}</p>
              )}

              {/* Color Preview */}
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: revision.config.primary_color }} />
                <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: revision.config.secondary_color }} />
                <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: revision.config.accent_color }} />
                <div className="w-8 h-8 rounded-full border-2 border-beige/30" style={{ backgroundColor: revision.config.background_color }} />
              </div>
            </div>
          );
        })}
      </div>

      {revisions.length === 0 && (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No revisions yet. Revisions are created automatically when you edit a theme.</p>
        </div>
      )}
    </div>
  );
}

// Theme Form Modal Component
function ThemeFormModal({ item, type, themes, campaigns, selectedCampaign, onSave, onClose }: any) {
  const [formData, setFormData] = useState<any>(item || {});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Initialize with defaults
      if (type === 'theme') {
        setFormData({
          name: '',
          description: '',
          preset_type: 'custom',
          is_active: false,
          is_default: false,
          config: {
            primary_color: '#D5AA64',
            secondary_color: '#6B3E28',
            accent_color: '#F2A0B4',
            background_color: '#FFF5E9',
            card_background_color: '#FFFCF7',
            text_color: '#4B2818',
            heading_color: '#4B2818',
            muted_text_color: '#6B3E28',
            border_color: '#EAC69C',
            button_color: '#4B2818',
            button_hover_color: '#6B3E28',
            header_background_color: '#FFF5E9',
            footer_background_color: '#4B2818',
            border_radius: '12px',
            shadow_style: 'soft',
          },
        });
      } else if (type === 'campaign') {
        setFormData({
          name: '',
          description: '',
          theme_preset_id: '',
          start_date: '',
          end_date: '',
          timezone: 'Asia/Kolkata',
          priority: 0,
          is_active: true,
          status: 'draft',
        });
      } else if (type === 'banner') {
        setFormData({
          title_en: '',
          title_hi: '',
          title_gu: '',
          subtitle_en: '',
          subtitle_hi: '',
          subtitle_gu: '',
          description_en: '',
          description_hi: '',
          description_gu: '',
          desktop_image_url: '',
          mobile_image_url: '',
          tablet_image_url: '',
          cta_text_en: '',
          cta_text_hi: '',
          cta_text_gu: '',
          cta_url: '',
          display_order: 0,
          is_active: true,
        });
      }
    }
  }, [item, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
      <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
          <h3 className="text-xl font-heading text-chocolate">
            {item ? 'Edit' : 'Create'} {type === 'theme' ? 'Theme' : type === 'campaign' ? 'Campaign' : 'Banner'}
          </h3>
          <button onClick={onClose} className="text-coffee/60 hover:text-chocolate">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {type === 'theme' && (
            <>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea-luxury"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Type</label>
                <select
                  value={formData.preset_type || 'custom'}
                  onChange={(e) => setFormData({ ...formData, preset_type: e.target.value })}
                  className="select-luxury"
                >
                  <option value="default">Default</option>
                  <option value="festival">Festival</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={formData.config?.primary_color || '#D5AA64'}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, primary_color: e.target.value } })}
                    className="input-luxury h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={formData.config?.secondary_color || '#6B3E28'}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, secondary_color: e.target.value } })}
                    className="input-luxury h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Accent Color</label>
                  <input
                    type="color"
                    value={formData.config?.accent_color || '#F2A0B4'}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, accent_color: e.target.value } })}
                    className="input-luxury h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={formData.config?.background_color || '#FFF5E9'}
                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, background_color: e.target.value } })}
                    className="input-luxury h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default || false}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Default Theme</span>
                </label>
              </div>
            </>
          )}

          {type === 'campaign' && (
            <>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea-luxury"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Theme Preset</label>
                <select
                  value={formData.theme_preset_id || ''}
                  onChange={(e) => setFormData({ ...formData, theme_preset_id: e.target.value })}
                  className="select-luxury"
                >
                  <option value="">Select a theme...</option>
                  {themes.map((theme: ThemePreset) => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date ? formData.start_date.slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date ? formData.end_date.slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input-luxury"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Priority</label>
                <input
                  type="number"
                  value={formData.priority || 0}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Status</label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="select-luxury"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </>
          )}

          {type === 'banner' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Title (English)</label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Title (Hindi)</label>
                  <input
                    type="text"
                    value={formData.title_hi || ''}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Title (Gujarati)</label>
                  <input
                    type="text"
                    value={formData.title_gu || ''}
                    onChange={(e) => setFormData({ ...formData, title_gu: e.target.value })}
                    className="input-luxury"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Desktop Image URL</label>
                <input
                  type="url"
                  value={formData.desktop_image_url || ''}
                  onChange={(e) => setFormData({ ...formData, desktop_image_url: e.target.value })}
                  className="input-luxury"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">CTA Text (EN)</label>
                  <input
                    type="text"
                    value={formData.cta_text_en || ''}
                    onChange={(e) => setFormData({ ...formData, cta_text_en: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">CTA Text (HI)</label>
                  <input
                    type="text"
                    value={formData.cta_text_hi || ''}
                    onChange={(e) => setFormData({ ...formData, cta_text_hi: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">CTA Text (GU)</label>
                  <input
                    type="text"
                    value={formData.cta_text_gu || ''}
                    onChange={(e) => setFormData({ ...formData, cta_text_gu: e.target.value })}
                    className="input-luxury"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">CTA URL</label>
                <input
                  type="url"
                  value={formData.cta_url || ''}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  className="input-luxury"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="input-luxury"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-6 border-t border-beige/20">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save size={16} /> Save
            </button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
