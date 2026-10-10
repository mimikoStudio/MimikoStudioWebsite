import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, X } from 'lucide-react';
import { getInvoiceById, downloadInvoicePDF, printInvoicePDF } from '../../lib/invoiceService';
import type { Invoice } from '../../types/invoice';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { invoiceTranslations } from '../../types/invoice';
import { getImageUrl } from '../../lib/imageUtils';

export default function InvoiceView() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const inv = await getInvoiceById(invoiceId!);
      setInvoice(inv);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (invoice) {
      printInvoicePDF(invoice);
    }
  };

  const handleDownload = () => {
    if (invoice) {
      downloadInvoicePDF(invoice);
    }
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

  const t = invoiceTranslations[invoice.language];
  const logoUrl = settings.logo_url ? getImageUrl(settings.logo_url) : null;

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
                  {t.invoice}
                </h2>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  <strong>{t.invoice_number}:</strong> {invoice.invoice_number}
                </p>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  <strong>{t.date}:</strong> {new Date(invoice.issued_date).toLocaleDateString()}
                </p>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  <strong>{t.due_date}:</strong> {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Business & Customer Info */}
          <div className="p-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: settings.primary_color }}>
                {t.bill_to}
              </h3>
              <div className="text-sm space-y-1" style={{ color: settings.text_color }}>
                <p className="font-bold">{invoice.customer_name}</p>
                {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}
                {invoice.customer_email && <p>Email: {invoice.customer_email}</p>}
                {invoice.billing_address && (
                  <div className="mt-2">
                    <p className="font-semibold">{t.bill_to}:</p>
                    <p>{invoice.billing_address}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase mb-3" style={{ color: settings.primary_color }}>
                {t.ship_to}
              </h3>
              <div className="text-sm space-y-1" style={{ color: settings.text_color }}>
                <p className="font-bold">{invoice.customer_name}</p>
                {invoice.shipping_address && (
                  <div>
                    <p>{invoice.shipping_address}</p>
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
                    {t.item}
                  </th>
                  <th className="text-center p-3 font-bold" style={{ color: settings.heading_color }}>
                    {t.quantity}
                  </th>
                  <th className="text-right p-3 font-bold" style={{ color: settings.heading_color }}>
                    {t.price}
                  </th>
                  <th className="text-right p-3 font-bold" style={{ color: settings.heading_color }}>
                    {t.total}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => {
                  const productName = invoice.language === 'hi' && item.product_name_hi
                    ? item.product_name_hi
                    : invoice.language === 'gu' && item.product_name_gu
                    ? item.product_name_gu
                    : item.product_name;

                  return (
                    <tr key={item.id} className="border-b" style={{ borderColor: settings.border_color }}>
                      <td className="p-3" style={{ color: settings.text_color }}>
                        {index + 1}
                      </td>
                      <td className="p-3" style={{ color: settings.text_color }}>
                        <div>
                          <p className="font-medium">{productName}</p>
                          {item.sku && (
                            <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center" style={{ color: settings.text_color }}>
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right" style={{ color: settings.text_color }}>
                        ₹{item.unit_price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-medium" style={{ color: settings.text_color }}>
                        ₹{item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-8">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: settings.text_color }}>
                    <span>{t.subtotal}:</span>
                    <span>₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>{t.tax}:</span>
                      <span>₹{invoice.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>{t.discount}:</span>
                      <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.shipping_charges > 0 && (
                    <div className="flex justify-between" style={{ color: settings.text_color }}>
                      <span>{t.shipping}:</span>
                      <span>₹{invoice.shipping_charges.toFixed(2)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-bold text-lg pt-2 border-t-2"
                    style={{ borderColor: settings.primary_color, color: settings.heading_color }}
                  >
                    <span>{t.grand_total}:</span>
                    <span>₹{invoice.total_amount.toFixed(2)}</span>
                  </div>
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
                    {t.payment_status}
                  </p>
                  <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                    {t[invoice.payment_status as keyof typeof t] || invoice.payment_status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: settings.heading_color }}>
                    {t.payment_method}
                  </p>
                  <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                    {invoice.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: settings.heading_color }}>
                    Invoice Status
                  </p>
                  <p className="text-xs mt-1" style={{ color: settings.muted_text_color }}>
                    {t[`status_${invoice.invoice_status}` as keyof typeof t] || invoice.invoice_status}
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
                  {t.notes}
                </p>
                <p className="text-sm" style={{ color: settings.text_color }}>
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: settings.heading_color }}>
                  {t.terms_and_conditions}
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
            <p className="font-bold mb-2">{t.thank_you}</p>
            <p className="text-xs">{settings.copyright_text || `© ${new Date().getFullYear()} ${settings.site_name}. All rights reserved.`}</p>
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
