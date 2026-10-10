import { useState, useEffect } from 'react';
import { FileText, Download, Printer, Eye, Trash2, Plus, Search } from 'lucide-react';
import { getInvoices, deleteInvoice, updateInvoiceStatus, getInvoiceSettings, updateInvoiceSettings } from '../../lib/invoiceService';
import type { Invoice, InvoiceSettings } from '../../types/invoice';
import { useNavigate } from 'react-router-dom';

export default function InvoiceManager() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadInvoices();
    loadSettings();
  }, [filterStatus, filterPayment]);

  const loadInvoices = async () => {
    setLoading(true);
    const filters: any = {};
    if (filterStatus !== 'all') filters.invoice_status = filterStatus;
    if (filterPayment !== 'all') filters.payment_status = filterPayment;
    
    const data = await getInvoices(filters);
    setInvoices(data);
    setLoading(false);
  };

  const loadSettings = async () => {
    const data = await getInvoiceSettings();
    setSettings(data);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    const result = await deleteInvoice(invoiceId);
    if (result.success) {
      alert('✅ Invoice deleted successfully!');
      loadInvoices();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const handleStatusChange = async (invoiceId: string, status: Invoice['invoice_status']) => {
    const result = await updateInvoiceStatus(invoiceId, status);
    if (result.success) {
      alert('✅ Invoice status updated!');
      loadInvoices();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        invoice.invoice_number.toLowerCase().includes(query) ||
        invoice.customer_name.toLowerCase().includes(query) ||
        invoice.customer_email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-coffee/10 text-coffee';
      case 'issued': return 'bg-gold/10 text-gold';
      case 'paid': return 'bg-sage/10 text-sage';
      case 'cancelled': return 'bg-blush/10 text-blush';
      default: return 'bg-coffee/10 text-coffee';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gold/10 text-gold';
      case 'paid': return 'bg-sage/10 text-sage';
      case 'failed': return 'bg-blush/10 text-blush';
      case 'refunded': return 'bg-coffee/10 text-coffee';
      default: return 'bg-coffee/10 text-coffee';
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
        <h2 className="text-2xl font-heading text-chocolate">📄 Invoice Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-outline flex items-center gap-2"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Invoice Settings */}
      {showSettings && settings && (
        <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-6">
          <h3 className="font-heading text-lg text-chocolate mb-4">Invoice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={settings.invoice_prefix}
                onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.default_tax_rate}
                onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Default Shipping Charges
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.default_shipping_charges}
                onChange={(e) => setSettings({ ...settings, default_shipping_charges: parseFloat(e.target.value) })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Default Language
              </label>
              <select
                value={settings.default_language}
                onChange={(e) => setSettings({ ...settings, default_language: e.target.value as any })}
                className="select-luxury"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Company Address
              </label>
              <textarea
                value={settings.company_address || ''}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                className="textarea-luxury"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Company Phone
              </label>
              <input
                type="tel"
                value={settings.company_phone || ''}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                Company Email
              </label>
              <input
                type="email"
                value={settings.company_email || ''}
                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                className="input-luxury"
              />
            </div>
            <div>
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={settings.company_gst_number || ''}
                onChange={(e) => setSettings({ ...settings, company_gst_number: e.target.value })}
                className="input-luxury"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={async () => {
                const result = await updateInvoiceSettings(settings);
                if (result.success) {
                  alert('✅ Settings saved!');
                  setShowSettings(false);
                } else {
                  alert(`❌ Error: ${result.error}`);
                }
              }}
              className="btn-primary"
            >
              Save Settings
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee/40" />
            <input
              type="text"
              placeholder="Search by invoice number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury !pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-luxury w-auto"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="select-luxury w-auto"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-pearl border border-beige/20 rounded-sm p-6 hover:shadow-luxury transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading text-lg text-chocolate">
                    {invoice.invoice_number}
                  </h3>
                  <span className={`badge-luxury ${getStatusColor(invoice.invoice_status)}`}>
                    {invoice.invoice_status}
                  </span>
                  <span className={`badge-luxury ${getPaymentColor(invoice.payment_status)}`}>
                    {invoice.payment_status}
                  </span>
                </div>
                <p className="text-xs text-coffee/50">
                  Issued: {new Date(invoice.issued_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-chocolate">₹{invoice.total_amount.toFixed(2)}</p>
                <p className="text-xs text-coffee/50">{invoice.items.length} items</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-coffee/50 text-xs mb-1">Customer</p>
                <p className="text-chocolate font-medium">{invoice.customer_name}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Email</p>
                <p className="text-chocolate">{invoice.customer_email}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Phone</p>
                <p className="text-chocolate">{invoice.customer_phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Language</p>
                <p className="text-chocolate uppercase">{invoice.language}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-beige/20">
              <button
                onClick={() => navigate(`/admin/invoice/${invoice.id}`)}
                className="btn-outline flex items-center gap-2"
              >
                <Eye size={14} /> View
              </button>
              <button
                onClick={() => {
                  // Download PDF
                  import('../../lib/invoiceService').then(({ downloadInvoicePDF }) => {
                    downloadInvoicePDF(invoice);
                  });
                }}
                className="btn-outline flex items-center gap-2"
              >
                <Download size={14} /> PDF
              </button>
              <button
                onClick={() => {
                  // Print PDF
                  import('../../lib/invoiceService').then(({ printInvoicePDF }) => {
                    printInvoicePDF(invoice);
                  });
                }}
                className="btn-outline flex items-center gap-2"
              >
                <Printer size={14} /> Print
              </button>
              <select
                value={invoice.invoice_status}
                onChange={(e) => handleStatusChange(invoice.id, e.target.value as any)}
                className="select-luxury flex-1"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => handleDelete(invoice.id)}
                className="btn-outline flex items-center gap-2"
              >
                <Trash2 size={14} className="text-blush" />
              </button>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
            <FileText size={48} className="mx-auto text-coffee/20 mb-4" />
            <p className="text-coffee/40">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
}
