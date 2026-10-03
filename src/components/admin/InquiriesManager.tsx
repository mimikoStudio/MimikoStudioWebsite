import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { useInquiries } from '../../hooks/useData';
import { createWhatsAppLink } from '../../lib/supabase';

export default function InquiriesManager() {
  const { inquiries, loading, refetch } = useInquiries();
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesSearch = 
      inq.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.reference_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      refetch();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-gold/10 text-gold border-gold/20',
      under_review: 'bg-sky/10 text-sky border-sky/20',
      quotation_sent: 'bg-sage/10 text-sage border-sage/20',
      awaiting_customer_response: 'bg-blush/10 text-blush border-blush/20',
      approved: 'bg-sage/10 text-sage border-sage/20',
      in_production: 'bg-rose/10 text-rose border-rose/20',
      completed: 'bg-leaf/10 text-leaf border-leaf/20',
      rejected: 'bg-chocolate/10 text-chocolate border-chocolate/20',
    };
    return colors[status] || 'bg-coffee/10 text-coffee border-coffee/20';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">💌 Inquiries Management</h2>
        <div className="text-sm text-coffee/60">
          Total: {inquiries.length} inquiries
        </div>
      </div>

      {/* Filters */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search by name or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury !pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-luxury"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="awaiting_customer_response">Awaiting Response</option>
            <option value="approved">Approved</option>
            <option value="in_production">In Production</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="bg-pearl border border-beige/20 rounded-sm p-6 hover:shadow-luxury transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading text-lg text-chocolate">
                    {inquiry.customer_name}
                  </h3>
                  <span className={`badge-luxury border ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-coffee/50">
                  Ref: {inquiry.reference_number} • {new Date(inquiry.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(inquiry)}
                className="btn-outline flex items-center gap-2"
              >
                <Eye size={14} /> View Details
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-coffee/50 text-xs mb-1">Product Type</p>
                <p className="text-chocolate font-medium">{inquiry.product_type}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Design Style</p>
                <p className="text-chocolate font-medium">{inquiry.design_style}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Budget</p>
                <p className="text-chocolate font-medium">{inquiry.budget || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Contact</p>
                <p className="text-chocolate font-medium">{inquiry.phone}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-beige/20">
              <a
                href={createWhatsAppLink(
                  `Hi ${inquiry.customer_name}! Regarding your inquiry ${inquiry.reference_number}...`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              {inquiry.status === 'new' && (
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, 'under_review')}
                  className="btn-outline flex items-center gap-2"
                >
                  <Clock size={14} /> Mark as Reviewing
                </button>
              )}
              {inquiry.status === 'under_review' && (
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, 'quotation_sent')}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={14} /> Send Quotation
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredInquiries.length === 0 && (
          <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
            <p className="text-coffee/40">No inquiries found</p>
          </div>
        )}
      </div>

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between">
              <h3 className="text-xl font-heading text-chocolate">
                Inquiry Details - {selectedInquiry.reference_number}
              </h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-coffee/60 hover:text-chocolate"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-coffee/50">Name</p>
                    <p className="text-chocolate">{selectedInquiry.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Email</p>
                    <p className="text-chocolate">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Phone</p>
                    <p className="text-chocolate">{selectedInquiry.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Submitted</p>
                    <p className="text-chocolate">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Product Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-coffee/50">Category</p>
                    <p className="text-chocolate">{selectedInquiry.product_category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Product Type</p>
                    <p className="text-chocolate">{selectedInquiry.product_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Design Style</p>
                    <p className="text-chocolate">{selectedInquiry.design_style}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Quantity</p>
                    <p className="text-chocolate">{selectedInquiry.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Size</p>
                    <p className="text-chocolate">{selectedInquiry.size || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Budget</p>
                    <p className="text-chocolate">{selectedInquiry.budget || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Preferences
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-coffee/50 mb-1">Fabric Preference</p>
                    <p className="text-chocolate">{selectedInquiry.fabric_preference || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50 mb-1">Preferred Colors</p>
                    <p className="text-chocolate">{selectedInquiry.preferred_colors || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50 mb-1">Custom Text</p>
                    <p className="text-chocolate">{selectedInquiry.custom_text || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50 mb-1">Preferred Date</p>
                    <p className="text-chocolate">
                      {selectedInquiry.preferred_date || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {selectedInquiry.instructions && (
                <div>
                  <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                    Additional Instructions
                  </h4>
                  <p className="text-chocolate bg-cream/30 p-4 rounded-sm">
                    {selectedInquiry.instructions}
                  </p>
                </div>
              )}

              {/* Reference Images */}
              {selectedInquiry.reference_image_urls && selectedInquiry.reference_image_urls.length > 0 && (
                <div>
                  <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                    Reference Images
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedInquiry.reference_image_urls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-sm border border-beige/20"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="pt-4 border-t border-beige/20">
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Update Status
                </h4>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusUpdate(selectedInquiry.id, e.target.value)}
                  className="select-luxury"
                >
                  <option value="new">New</option>
                  <option value="under_review">Under Review</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="awaiting_customer_response">Awaiting Customer Response</option>
                  <option value="approved">Approved</option>
                  <option value="in_production">In Production</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-beige/20">
                <a
                  href={createWhatsAppLink(
                    `Hi ${selectedInquiry.customer_name}! Regarding your inquiry ${selectedInquiry.reference_number}...`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Contact via WhatsApp
                </a>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="btn-outline flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
