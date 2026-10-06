import { useState, useEffect } from 'react';
import { 
  MessageCircle, Edit, Eye, Check, X, Save, RotateCcw, 
  AlertCircle, Copy, RefreshCw
} from 'lucide-react';
import { 
  getWhatsAppTemplates, 
  saveWhatsAppTemplate, 
  getWhatsAppSettings,
  saveWhatsAppSettings,
  renderWhatsAppTemplate,
  initializeDefaultTemplates,
  getWhatsAppMessageLogs
} from '../../lib/whatsappService';
import { 
  WhatsAppTemplate, 
  WhatsAppTemplateKey,
  WhatsAppSettings,
  WhatsAppMessageLog,
  WhatsAppTemplateVariables
} from '../../types/whatsapp';

export default function WhatsAppSettingsManager() {
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'logs'>('templates');
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewData, setPreviewData] = useState<WhatsAppTemplateVariables>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'templates') {
        const templatesData = await getWhatsAppTemplates();
        setTemplates(templatesData);
      } else if (activeTab === 'settings') {
        const settingsData = await getWhatsAppSettings();
        setSettings(settingsData);
      } else if (activeTab === 'logs') {
        const logsData = await getWhatsAppMessageLogs(50);
        setLogs(logsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      const saved = await saveWhatsAppTemplate(editingTemplate);
      setTemplates(prev => prev.map(t => t.id === saved.id ? saved : t));
      setEditingTemplate(null);
      setMessage({ type: 'success', text: '✅ Template saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: '❌ Error saving template: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await saveWhatsAppSettings(settings);
      setMessage({ type: 'success', text: '✅ Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: '❌ Error saving settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm('This will initialize all default templates. Continue?')) return;

    setSaving(true);
    try {
      await initializeDefaultTemplates();
      await loadData();
      setMessage({ type: 'success', text: '✅ Default templates initialized!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: '❌ Error initializing templates: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const getPreviewMessage = () => {
    if (!editingTemplate) return '';
    return renderWhatsAppTemplate(editingTemplate.message_body, previewData);
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
        <h2 className="text-2xl font-heading text-chocolate">💬 WhatsApp Settings</h2>
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
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'templates'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <MessageCircle size={16} />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <Edit size={16} />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'logs'
                ? 'text-gold border-b-2 border-gold bg-gold/5'
                : 'text-coffee/60 hover:text-chocolate hover:bg-cream/30'
            }`}
          >
            <Eye size={16} />
            Message Logs
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'templates' && (
            <TemplatesTab
              templates={templates}
              editingTemplate={editingTemplate}
              setEditingTemplate={setEditingTemplate}
              onSave={handleSaveTemplate}
              saving={saving}
              previewData={previewData}
              setPreviewData={setPreviewData}
              getPreviewMessage={getPreviewMessage}
              onInitializeDefaults={handleInitializeDefaults}
            />
          )}
          {activeTab === 'settings' && settings && (
            <SettingsTab
              settings={settings}
              setSettings={setSettings}
              onSave={handleSaveSettings}
              saving={saving}
            />
          )}
          {activeTab === 'logs' && (
            <LogsTab logs={logs} />
          )}
        </div>
      </div>
    </div>
  );
}

// Templates Tab
function TemplatesTab({
  templates,
  editingTemplate,
  setEditingTemplate,
  onSave,
  saving,
  previewData,
  setPreviewData,
  getPreviewMessage,
  onInitializeDefaults,
}: any) {
  const availableVariables = [
    { group: 'Customer', vars: ['customer_name', 'customer_phone', 'customer_email'] },
    { group: 'Business', vars: ['business_name', 'business_phone', 'website_url'] },
    { group: 'Order', vars: ['order_number', 'order_date', 'order_status', 'order_total', 'currency', 'items_summary'] },
    { group: 'Product', vars: ['product_name', 'product_price', 'product_url'] },
    { group: 'Inquiry', vars: ['inquiry_id', 'inquiry_type', 'inquiry_message'] },
    { group: 'Booking', vars: ['booking_date', 'booking_time', 'service_name'] },
    { group: 'Payment', vars: ['payment_status', 'payment_method'] },
    { group: 'Default', vars: ['default_greeting', 'default_footer', 'current_date', 'current_time'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-chocolate">Message Templates</h3>
        <button
          onClick={onInitializeDefaults}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Initialize Defaults
        </button>
      </div>

      {!editingTemplate ? (
        <div className="space-y-3">
          {templates.map((template: WhatsAppTemplate) => (
            <div
              key={template.id}
              className="bg-ivory border border-beige/20 rounded-sm p-4 hover:shadow-curved transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-chocolate">{template.template_name}</h4>
                    <span className={`badge-luxury ${
                      template.is_active ? 'bg-sage/10 text-sage' : 'bg-coffee/10 text-coffee'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge-luxury bg-gold/10 text-gold">
                      {template.recipient_type}
                    </span>
                  </div>
                  <p className="text-xs text-coffee/50 mb-2">{template.description}</p>
                  <p className="text-xs text-coffee/40 font-mono">{template.template_key}</p>
                </div>
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="btn-outline flex items-center gap-2"
                >
                  <Edit size={14} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-lg text-chocolate">
              Edit Template: {editingTemplate.template_name}
            </h4>
            <button
              onClick={() => setEditingTemplate(null)}
              className="text-coffee/60 hover:text-chocolate"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={editingTemplate.template_name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Recipient Type
                </label>
                <select
                  value={editingTemplate.recipient_type}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, recipient_type: e.target.value })}
                  className="select-luxury"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="BUSINESS">Business</option>
                  <option value="SALES">Sales</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingTemplate.is_active}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                    className="accent-gold"
                  />
                  <span className="text-sm text-coffee/70">Active</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Message Body
                </label>
                <textarea
                  value={editingTemplate.message_body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, message_body: e.target.value })}
                  className="textarea-luxury font-mono text-xs"
                  rows={15}
                  placeholder="Use {{variable_name}} for dynamic values"
                />
              </div>

              {/* Available Variables */}
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Available Variables (click to copy)
                </label>
                <div className="space-y-2">
                  {availableVariables.map((group: any) => (
                    <div key={group.group}>
                      <p className="text-xs font-medium text-gold mb-1">{group.group}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.vars.map((v: string) => (
                          <button
                            key={v}
                            onClick={() => {
                              navigator.clipboard.writeText(`{{${v}}}`);
                              alert(`Copied: {{${v}}}`);
                            }}
                            className="text-xs px-2 py-1 bg-cream/50 hover:bg-gold/10 rounded-sm text-coffee/70 hover:text-gold transition-colors font-mono"
                          >
                            {`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Preview Data (for testing)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="customer_name"
                    value={previewData.customer_name || ''}
                    onChange={(e) => setPreviewData({ ...previewData, customer_name: e.target.value })}
                    className="input-luxury text-xs"
                  />
                  <input
                    type="text"
                    placeholder="order_number"
                    value={previewData.order_number || ''}
                    onChange={(e) => setPreviewData({ ...previewData, order_number: e.target.value })}
                    className="input-luxury text-xs"
                  />
                  <input
                    type="text"
                    placeholder="order_total"
                    value={previewData.order_total || ''}
                    onChange={(e) => setPreviewData({ ...previewData, order_total: e.target.value })}
                    className="input-luxury text-xs"
                  />
                  <input
                    type="text"
                    placeholder="business_name"
                    value={previewData.business_name || ''}
                    onChange={(e) => setPreviewData({ ...previewData, business_name: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  Preview
                </label>
                <div className="bg-[#E5DDD5] rounded-sm p-4 min-h-[400px]">
                  <pre className="text-sm text-chocolate whitespace-pre-wrap font-body">
                    {getPreviewMessage()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Settings Tab
function SettingsTab({ settings, setSettings, onSave, saving }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg text-chocolate">WhatsApp Configuration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
            Business WhatsApp Number
          </label>
          <input
            type="text"
            value={settings.business_whatsapp_number}
            onChange={(e) => setSettings({ ...settings, business_whatsapp_number: e.target.value })}
            className="input-luxury"
            placeholder="+917874291924"
          />
        </div>

        <div>
          <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
            Country Code
          </label>
          <input
            type="text"
            value={settings.country_code}
            onChange={(e) => setSettings({ ...settings, country_code: e.target.value })}
            className="input-luxury"
            placeholder="+91"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-chocolate">Enable/Disable Features</h4>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_whatsapp}
            onChange={(e) => setSettings({ ...settings, enable_whatsapp: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-coffee/70">Enable WhatsApp</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_customer_messages}
            onChange={(e) => setSettings({ ...settings, enable_customer_messages: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-coffee/70">Enable Customer Messages</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_admin_notifications}
            onChange={(e) => setSettings({ ...settings, enable_admin_notifications: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-coffee/70">Enable Admin Notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_order_notifications}
            onChange={(e) => setSettings({ ...settings, enable_order_notifications: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-coffee/70">Enable Order Notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_inquiry_notifications}
            onChange={(e) => setSettings({ ...settings, enable_inquiry_notifications: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-coffee/70">Enable Inquiry Notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_booking_notifications}
            onChange={(e) => setSettings({ ...settings, enable_booking_notifications: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-sm text-coffee/70">Enable Booking Notifications</span>
        </label>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-chocolate">Default Messages</h4>
        <div>
          <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
            Default Greeting
          </label>
          <input
            type="text"
            value={settings.default_greeting}
            onChange={(e) => setSettings({ ...settings, default_greeting: e.target.value })}
            className="input-luxury"
            placeholder="Hello 👋"
          />
        </div>
        <div>
          <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
            Default Footer
          </label>
          <input
            type="text"
            value={settings.default_footer}
            onChange={(e) => setSettings({ ...settings, default_footer: e.target.value })}
            className="input-luxury"
            placeholder="Thank you for choosing {{business_name}} 💎"
          />
        </div>
        <div>
          <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
            Business Signature
          </label>
          <input
            type="text"
            value={settings.business_signature}
            onChange={(e) => setSettings({ ...settings, business_signature: e.target.value })}
            className="input-luxury"
            placeholder="{{business_name}} Team"
          />
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2"
      >
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

// Logs Tab
function LogsTab({ logs }: any) {
  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg text-chocolate">Message Logs</h3>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
          <p className="text-coffee/40">No message logs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log: WhatsAppMessageLog) => (
            <div
              key={log.id}
              className="bg-ivory border border-beige/20 rounded-sm p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-chocolate">
                    {log.recipient_type} - {log.entity_type}
                  </p>
                  <p className="text-xs text-coffee/50">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`badge-luxury ${
                  log.status === 'generated' ? 'bg-gold/10 text-gold' :
                  log.status === 'opened' ? 'bg-sage/10 text-sage' :
                  log.status === 'sent' ? 'bg-sky/10 text-sky' :
                  'bg-blush/10 text-blush'
                }`}>
                  {log.status}
                </span>
              </div>
              <p className="text-xs text-coffee/60 mb-2">
                To: {log.recipient_phone}
              </p>
              <details className="text-xs">
                <summary className="cursor-pointer text-gold hover:text-chocolate transition-colors">
                  View Message
                </summary>
                <pre className="mt-2 p-3 bg-cream/50 rounded-sm text-chocolate whitespace-pre-wrap font-body">
                  {log.message_body}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
