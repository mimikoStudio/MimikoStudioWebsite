import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { 
  getAllContentSections, 
  createContentSection, 
  updateContentSection, 
  deleteContentSection,
  getActiveNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getBusinessProfile,
  updateBusinessProfile
} from '../../lib/dynamicContentService';
import type { WebsiteContentSection, DynamicNotification, BusinessProfile } from '../../types';

type Tab = 'sections' | 'notifications' | 'business';

export default function DynamicContentManager() {
  const [activeTab, setActiveTab] = useState<Tab>('sections');
  const [sections, setSections] = useState<WebsiteContentSection[]>([]);
  const [notifications, setNotifications] = useState<DynamicNotification[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sections') {
        const data = await getAllContentSections();
        setSections(data);
      } else if (activeTab === 'notifications') {
        const data = await getActiveNotifications();
        setNotifications(data);
      } else if (activeTab === 'business') {
        const data = await getBusinessProfile();
        setBusinessProfile(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl font-heading text-chocolate">🎨 Dynamic Content Manager</h2>
      </div>

      {/* Tabs */}
      <div className="bg-pearl border border-beige/20 rounded-sm mb-6">
        <div className="flex overflow-x-auto border-b border-beige/20">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'sections'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            📄 Content Sections
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'notifications'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'business'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            🏢 Business Profile
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sections' && (
            <ContentSectionsTab
              sections={sections}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={notifications}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'business' && businessProfile && (
            <BusinessProfileTab
              profile={businessProfile}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Content Sections Tab
function ContentSectionsTab({ sections, onRefresh }: { sections: WebsiteContentSection[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<WebsiteContentSection | null>(null);
  const [formData, setFormData] = useState<Partial<WebsiteContentSection>>({
    section_key: '',
    section_name: '',
    section_type: 'banner',
    content_en: '',
    content_hi: '',
    content_gu: '',
    image_url: '',
    button_label_en: '',
    button_label_hi: '',
    button_label_gu: '',
    button_url: '',
    is_visible: true,
    display_order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSection) {
      const result = await updateContentSection(editingSection.id, formData);
      if (!result.success) {
        alert(`Update failed: ${result.error}`);
        return;
      }
    } else {
      const result = await createContentSection(formData);
      if (!result.success) {
        alert(`Create failed: ${result.error}`);
        return;
      }
    }

    setShowForm(false);
    setEditingSection(null);
    resetForm();
    onRefresh();
  };

  const handleEdit = (section: WebsiteContentSection) => {
    setEditingSection(section);
    setFormData(section);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content section?')) return;

    const result = await deleteContentSection(id);
    if (!result.success) {
      alert(`Delete failed: ${result.error}`);
      return;
    }

    onRefresh();
  };

  const handleToggleVisibility = async (section: WebsiteContentSection) => {
    const result = await updateContentSection(section.id, { is_visible: !section.is_visible });
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
      return;
    }
    onRefresh();
  };

  const resetForm = () => {
    setFormData({
      section_key: '',
      section_name: '',
      section_type: 'banner',
      content_en: '',
      content_hi: '',
      content_gu: '',
      image_url: '',
      button_label_en: '',
      button_label_hi: '',
      button_label_gu: '',
      button_url: '',
      is_visible: true,
      display_order: sections.length,
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSection(null);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`bg-pearl border rounded-sm p-4 ${
              section.is_visible ? 'border-beige/20' : 'border-beige/10 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading text-lg text-chocolate">{section.section_name}</h3>
                  <span className="badge-luxury bg-gold/10 text-gold">
                    {section.section_type}
                  </span>
                  <span className="text-xs text-coffee/50 font-mono">{section.section_key}</span>
                </div>
                <p className="text-sm text-coffee/60 mb-2">
                  {section.content_en?.substring(0, 100)}...
                </p>
                <div className="flex gap-4 text-xs text-coffee/50">
                  <span>Order: {section.display_order}</span>
                  <span>{section.is_visible ? '✅ Visible' : '👁️ Hidden'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleVisibility(section)}
                  className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                  title={section.is_visible ? 'Hide' : 'Show'}
                >
                  {section.is_visible ? <Eye size={16} className="text-sage" /> : <EyeOff size={16} className="text-coffee/40" />}
                </button>
                <button
                  onClick={() => handleEdit(section)}
                  className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                  title="Edit"
                >
                  <Edit size={16} className="text-gold" />
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="p-2 hover:bg-blush/10 rounded-sm transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-blush" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
            <p className="text-coffee/40">No content sections yet. Click "Add Section" to create one.</p>
          </div>
        )}
      </div>

      {/* Section Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <h3 className="text-xl font-heading text-chocolate">
                {editingSection ? 'Edit Content Section' : 'Add New Content Section'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSection(null);
                  resetForm();
                }}
                className="text-coffee/60 hover:text-chocolate"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Section Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.section_key}
                    onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
                    className="input-luxury"
                    placeholder="hero_banner_1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.section_name}
                    onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                    className="input-luxury"
                    placeholder="Hero Banner 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Section Type *
                </label>
                <select
                  required
                  value={formData.section_type}
                  onChange={(e) => setFormData({ ...formData, section_type: e.target.value as any })}
                  className="select-luxury"
                >
                  <option value="hero">Hero</option>
                  <option value="banner">Banner</option>
                  <option value="notification">Notification</option>
                  <option value="button">Button</option>
                  <option value="textbox">Textbox</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Content (English)
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="English content..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Content (Hindi)
                </label>
                <textarea
                  value={formData.content_hi}
                  onChange={(e) => setFormData({ ...formData, content_hi: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="हिंदी सामग्री..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Content (Gujarati)
                </label>
                <textarea
                  value={formData.content_gu}
                  onChange={(e) => setFormData({ ...formData, content_gu: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="ગુજરાતી સામગ્રી..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-luxury"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Button Label (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.button_label_en}
                    onChange={(e) => setFormData({ ...formData, button_label_en: e.target.value })}
                    className="input-luxury"
                    placeholder="Learn More"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Button Label (HI)
                  </label>
                  <input
                    type="text"
                    value={formData.button_label_hi}
                    onChange={(e) => setFormData({ ...formData, button_label_hi: e.target.value })}
                    className="input-luxury"
                    placeholder="और जानें"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Button Label (GU)
                  </label>
                  <input
                    type="text"
                    value={formData.button_label_gu}
                    onChange={(e) => setFormData({ ...formData, button_label_gu: e.target.value })}
                    className="input-luxury"
                    placeholder="વધુ જાણો"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Button URL
                </label>
                <input
                  type="url"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  className="input-luxury"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Visibility
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="text-sm text-coffee/70">Visible on website</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSection(null);
                    resetForm();
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Notifications Tab
function NotificationsTab({ notifications, onRefresh }: { notifications: DynamicNotification[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<DynamicNotification | null>(null);
  const [formData, setFormData] = useState<Partial<DynamicNotification>>({
    notification_type: 'info',
    title_en: '',
    title_hi: '',
    title_gu: '',
    message_en: '',
    message_hi: '',
    message_gu: '',
    is_active: true,
    target_audience: 'all',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotification) {
      const result = await updateNotification(editingNotification.id, formData);
      if (!result.success) {
        alert(`Update failed: ${result.error}`);
        return;
      }
    } else {
      const result = await createNotification(formData);
      if (!result.success) {
        alert(`Create failed: ${result.error}`);
        return;
      }
    }

    setShowForm(false);
    setEditingNotification(null);
    resetForm();
    onRefresh();
  };

  const handleEdit = (notification: DynamicNotification) => {
    setEditingNotification(notification);
    setFormData(notification);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;

    const result = await deleteNotification(id);
    if (!result.success) {
      alert(`Delete failed: ${result.error}`);
      return;
    }

    onRefresh();
  };

  const resetForm = () => {
    setFormData({
      notification_type: 'info',
      title_en: '',
      title_hi: '',
      title_gu: '',
      message_en: '',
      message_hi: '',
      message_gu: '',
      is_active: true,
      target_audience: 'all',
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNotification(null);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Notification
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-pearl border rounded-sm p-4 ${
              notification.is_active ? 'border-beige/20' : 'border-beige/10 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading text-lg text-chocolate">{notification.title_en}</h3>
                  <span className={`badge-luxury ${
                    notification.notification_type === 'success' ? 'bg-sage/10 text-sage' :
                    notification.notification_type === 'error' ? 'bg-blush/10 text-blush' :
                    notification.notification_type === 'warning' ? 'bg-gold/10 text-gold' :
                    notification.notification_type === 'promo' ? 'bg-rose/10 text-rose' :
                    'bg-sky/10 text-sky'
                  }`}>
                    {notification.notification_type}
                  </span>
                </div>
                <p className="text-sm text-coffee/60 mb-2">
                  {notification.message_en}
                </p>
                <div className="flex gap-4 text-xs text-coffee/50">
                  <span>Target: {notification.target_audience}</span>
                  <span>{notification.is_active ? '✅ Active' : '⏸️ Inactive'}</span>
                  {notification.expires_at && (
                    <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(notification)}
                  className="p-2 hover:bg-gold/10 rounded-sm transition-colors"
                  title="Edit"
                >
                  <Edit size={16} className="text-gold" />
                </button>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 hover:bg-blush/10 rounded-sm transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-blush" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
            <p className="text-coffee/40">No notifications yet. Click "Add Notification" to create one.</p>
          </div>
        )}
      </div>

      {/* Notification Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between sticky top-0 bg-pearl z-10">
              <h3 className="text-xl font-heading text-chocolate">
                {editingNotification ? 'Edit Notification' : 'Add New Notification'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="text-coffee/60 hover:text-chocolate"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Notification Type *
                  </label>
                  <select
                    required
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value as any })}
                    className="select-luxury"
                  >
                    <option value="info">Information</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="promo">Promotional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="select-luxury"
                  >
                    <option value="all">All Users</option>
                    <option value="customers">Customers Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="input-luxury"
                  placeholder="Notification title"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Title (Hindi)
                </label>
                <input
                  type="text"
                  value={formData.title_hi}
                  onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                  className="input-luxury"
                  placeholder="अधिसूचना शीर्षक"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Title (Gujarati)
                </label>
                <input
                  type="text"
                  value={formData.title_gu}
                  onChange={(e) => setFormData({ ...formData, title_gu: e.target.value })}
                  className="input-luxury"
                  placeholder="સૂચના શીર્ષક"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Message (English) *
                </label>
                <textarea
                  required
                  value={formData.message_en}
                  onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="Notification message..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Message (Hindi)
                </label>
                <textarea
                  value={formData.message_hi}
                  onChange={(e) => setFormData({ ...formData, message_hi: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="अधिसूचना संदेश..."
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Message (Gujarati)
                </label>
                <textarea
                  value={formData.message_gu}
                  onChange={(e) => setFormData({ ...formData, message_gu: e.target.value })}
                  className="textarea-luxury"
                  rows={3}
                  placeholder="સૂચના સંદેશ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at?.slice(0, 16) || ''}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Status
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="accent-gold"
                    />
                    <span className="text-sm text-coffee/70">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-beige/20">
                <button type="submit" className="btn-primary flex-1">
                  {editingNotification ? 'Update Notification' : 'Create Notification'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNotification(null);
                    resetForm();
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Business Profile Tab
function BusinessProfileTab({ profile, onRefresh }: { profile: BusinessProfile; onRefresh: () => void }) {
  const [formData, setFormData] = useState(profile);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateBusinessProfile(formData);
    if (!result.success) {
      alert(`Update failed: ${result.error}`);
    } else {
      alert('✅ Business profile updated successfully!');
      onRefresh();
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🏢 Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Studio Name *
            </label>
            <input
              type="text"
              required
              value={formData.studio_name}
              onChange={(e) => setFormData({ ...formData, studio_name: e.target.value })}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url || ''}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="input-luxury"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-luxury"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Address
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="textarea-luxury"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Tax Registration
            </label>
            <input
              type="text"
              value={formData.tax_registration || ''}
              onChange={(e) => setFormData({ ...formData, tax_registration: e.target.value })}
              className="input-luxury"
              placeholder="GSTIN, PAN, etc."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-lg text-chocolate mb-4">🌐 Localization</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Default Currency
            </label>
            <select
              value={formData.default_currency}
              onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
              className="select-luxury"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
              Default Language
            </label>
            <select
              value={formData.default_language}
              onChange={(e) => setFormData({ ...formData, default_language: e.target.value as any })}
              className="select-luxury"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-beige/20">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : 'Save Business Profile'}
        </button>
      </div>
    </form>
  );
}
