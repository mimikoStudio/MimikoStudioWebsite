import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, X } from 'lucide-react';
import { getInvoice, Invoice } from '../../lib/invoiceService';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { getImageUrl } from '../../lib/imageUtils';

export default function InvoiceView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadInvoice();
    }
  }, [orderId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const inv = await getInvoice(orderId!);
      setInvoice(inv);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, use print to PDF
    // In production, you could use a library like jsPDF
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="spinner-luxury" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="text-chocolate mb-4">Invoice not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const order = invoice.order;
  if (!order) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="text-chocolate mb-4">Order details not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const logoUrl = getImageUrl(settings.logo_url);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Action Buttons - Hidden in print */}
      <div className="no-print bg-pearl border-b border-beige/20 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-coffee/60 hover:text-chocolate transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="btn-outline flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white shadow-lg print:shadow-none">
          {/* Invoice Header */}
          <div className="p-8 border-b-2" style={{ borderColor: settings.primary_color }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={settings.site_name}
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: settings.primary_color + '20' }}
                  >
                    <span className="text-3xl">🎨</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: settings.heading_color }}>
                    {settings.site_name}
                  </h1>
                  {settings.site_tagline && (
                    <p className="text-sm" style={{ color: settings.muted_text_color }}>
                      {settings.site_tagline}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold mb-2" style={{ color: settings.primary_color }}>
                  INVOICE
                </h2>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  <strong>Invoice #:</strong> {invoice.invoice_number}
                </p>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  <strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}
                </p>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  <strong>Order #:</strong> {order.order_number}
                </p>
              </div>
            </div>
          </div>

          {/* Business & Customer Info */}
          <div className="p-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: settings.primary_color }}>
                From
              </h3>
              <div className="text-sm space-y-1" style={{ color: settings.text_color }}>
                <p className="font-bold">{settings.site_name}</p>
                {settings.address && <p>{settings.address}</p>}
                {settings.phone && <p>Phone: {settings.phone}</p>}
                {settings.email && <p>Email: {settings.email}</p>}
                {settings.whatsapp && <p>WhatsApp: {settings.whatsapp}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: settings.primary_color }}>
                Bill To
              </h3>
              <div className="text-sm space-y-1" style={{ color: settings.text_color }}>
                <p className="font-bold">{order.customer_name}</p>
                {order.phone && <p>Phone: {order.phone}</p>}
                {order.email && <p>Email: {order.email}</p>}
                {order.shipping_address && (
                  <div>
                    <p className="font-semibold mt-2">Shipping Address:</p>
                    <p>{order.shipping_address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="px-8 pb-8">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: settings.primary_color + '10' }}>
                  <th className="text-left p-3 font-bold" style={{ color: settings.heading_color }}>
                    #
                  </th>
                  <th className="text-left p-3 font-bold" style={{ color: settings.heading_color }}>
                    Product
                  </th>
                  <th className="text-center p-3 font-bold" style={{ color: settings.heading_color }}>
                    Qty
                  </th>
                  <th className="text-right p-3 font-bold" style={{ color: settings.heading_color }}>
                    Price
                  </th>
                  <th className="text-right p-3 font-bold" style={{ color: settings.heading_color }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {(order as any).order_items?.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b" style={{ borderColor: settings.border_color }}>
                    <td className="p-3" style={{ color: settings.text_color }}>
                      {index + 1}
                    </td>
                    <td className="p-3" style={{ color: settings.text_color }}>
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                          <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                            {Object.entries(item.selected_options)
                              .filter(([_, value]) => value)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center" style={{ color: settings.text_color }}>
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right" style={{ color: settings.text_color }}>
                      ₹{item.unit_price.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-medium" style={{ color: settings.text_color }}>
                      ₹{(item.unit_price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-8">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: settings.text_color }}>
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toLocaleString()}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>Discount:</span>
                      <span>-₹{invoice.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>Tax:</span>
                      <span>₹{invoice.tax_amount.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.shipping_amount > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>Shipping:</span>
                      <span>₹{invoice.shipping_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-bold text-lg pt-2 border-t-2"
                    style={{ borderColor: settings.primary_color, color: settings.heading_color }}
                  >
                    <span>Total:</span>
                    <span>₹{invoice.total_amount.toLocaleString()}</span>
                  </div>
                  {invoice.amount_paid > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>Amount Paid:</span>
                      <span>₹{invoice.amount_paid.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.balance_due > 0 && (
                    <div className="flex justify-between font-bold" style={{ color: settings.primary_color }}>
                      <span>Balance Due:</span>
                      <span>₹{invoice.balance_due.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="px-8 pb-8">
            <div className="p-4 rounded" style={{ backgroundColor: settings.primary_color + '10' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold" style={{ color: settings.heading_color }}>
                    Payment Status
                  </p>
                  <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                    {order.payment_status === 'paid' ? 'Paid' : 
                     order.payment_status === 'pending' ? 'Pending' :
                     order.payment_status === 'failed' ? 'Failed' : 'Refunded'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: settings.heading_color }}>
                    Order Status
                  </p>
                  <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="px-8 pb-8">
            {invoice.notes && (
              <div className="mb-4">
                <p className="text-sm font-bold mb-2" style={{ color: settings.heading_color }}>
                  Notes
                </p>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: settings.heading_color }}>
                  Terms & Conditions
                </p>
                <p className="text-xs" style={{ color: settings.muted_text_color }}>
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="p-8 text-center text-sm"
            style={{ backgroundColor: settings.footer_background_color, color: settings.background_color }}
          >
            <p className="font-bold mb-2">Thank you for your business!</p>
            <p className="text-xs">{settings.copyright_text}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
