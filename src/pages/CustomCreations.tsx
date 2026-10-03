import React, { useState } from 'react';
import { Upload, Palette, CheckCircle, MessageCircle } from 'lucide-react';
import { createWhatsAppLink, generateReferenceNumber } from '../lib/supabase';

const designStyles = ['Floral', 'Minimalist', 'Traditional', 'Abstract', 'Nature-inspired', 'Personalized Lettering', 'Custom Design'];
const productCategories = ['Clothing', 'Bags', 'Home Decor', 'Accessories', 'Gifts', 'Small Creations'];
const budgetRanges = ['Under ₹500', '₹500 - ₹1,000', '₹1,000 - ₹2,000', '₹2,000 - ₹5,000', '₹5,000+'];

export default function CustomCreations() {
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', productCategory: '', productType: '',
    fabricPreference: '', preferredColors: '', designStyle: '', customText: '',
    size: '', quantity: '1', budget: '', preferredDate: '', instructions: '',
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = generateReferenceNumber('CUS');
    setReferenceNumber(ref);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-champagne/10 flex items-center justify-center">
            <CheckCircle size={40} className="text-champagne" />
          </div>
          <h1 className="font-heading text-3xl font-light text-espresso mb-4">Request Submitted!</h1>
          <p className="text-espresso/60 mb-2">Your custom creation request has been received.</p>
          <p className="text-sm text-espresso/40 mb-6">Reference: <span className="font-medium text-champagne">{referenceNumber}</span></p>
          <div className="bg-pearl border border-beige/30 rounded-sm p-6 mb-8 text-left">
            <p className="text-sm text-espresso/70 mb-4">
              <strong>What happens next?</strong><br />
              Our team will review your request and get back to you with a quotation and estimated delivery timeline within 24-48 hours.
            </p>
            <p className="text-sm text-espresso/70">
              You can also reach us directly on WhatsApp for faster communication.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={createWhatsAppLink(`Hi! I just submitted a custom creation request. Reference: ${referenceNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury-filled flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
            <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', productCategory: '', productType: '', fabricPreference: '', preferredColors: '', designStyle: '', customText: '', size: '', quantity: '1', budget: '', preferredDate: '', instructions: '' }); }} className="btn-luxury">
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-espresso to-chocolate relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212,175,114,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Personalize</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-pearl mt-4 mb-6">
            Design Your Own Creation
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-pearl/60 max-w-2xl mx-auto">
            Have a unique vision? Tell us about it and we'll bring it to life with our hand-painted artistry.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-ivory">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-pearl border border-beige/20 rounded-sm p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-luxury" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-luxury" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">WhatsApp Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-luxury" placeholder="+91 XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Product Category *</label>
                <select name="productCategory" value={formData.productCategory} onChange={handleChange} required className="select-luxury">
                  <option value="">Select category</option>
                  {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Product Type *</label>
                <input type="text" name="productType" value={formData.productType} onChange={handleChange} required className="input-luxury" placeholder="e.g., T-shirt, Tote bag, Cushion cover" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Fabric Preference</label>
                <input type="text" name="fabricPreference" value={formData.fabricPreference} onChange={handleChange} className="input-luxury" placeholder="e.g., Cotton, Silk, Canvas" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Preferred Colors</label>
                <input type="text" name="preferredColors" value={formData.preferredColors} onChange={handleChange} className="input-luxury" placeholder="e.g., Pastel pink, Gold, Sage" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Design Style *</label>
                <select name="designStyle" value={formData.designStyle} onChange={handleChange} required className="select-luxury">
                  <option value="">Select style</option>
                  {designStyles.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Custom Text/Name</label>
                <input type="text" name="customText" value={formData.customText} onChange={handleChange} className="input-luxury" placeholder="Text to be painted" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Size</label>
                <input type="text" name="size" value={formData.size} onChange={handleChange} className="input-luxury" placeholder="e.g., M, XL, Free size" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Quantity</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className="input-luxury" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Budget Range</label>
                <select name="budget" value={formData.budget} onChange={handleChange} className="select-luxury">
                  <option value="">Select budget</option>
                  {budgetRanges.map(range => <option key={range} value={range}>{range}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Preferred Completion Date</label>
                <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="input-luxury" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Reference Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setReferenceImage(e.target.files?.[0] || null)}
                    className="hidden"
                    id="reference-upload"
                  />
                  <label htmlFor="reference-upload" className="input-luxury flex items-center gap-3 cursor-pointer hover:border-champagne transition-colors">
                    <Upload size={16} className="text-champagne" />
                    <span className="text-sm text-espresso/50">{referenceImage ? referenceImage.name : 'Upload reference image'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Additional Instructions</label>
              <textarea name="instructions" value={formData.instructions} onChange={handleChange} className="textarea-luxury" placeholder="Tell us more about your vision, any specific requirements, or inspiration..." />
            </div>

            <div className="mt-8 p-4 bg-champagne/5 border border-champagne/10 rounded-sm">
              <p className="text-xs text-espresso/60">
                <Palette size={14} className="inline mr-2 text-champagne" />
                <strong>Design Preview Note:</strong> The final quotation and delivery date will be confirmed after our team reviews your request. This is a concept submission, not a final order confirmation.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button type="submit" className="btn-luxury-filled flex-1">
                Submit Request
              </button>
              <a
                href={createWhatsAppLink('Hi! I would like to discuss a custom fabric art creation.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-luxury flex-1 text-center"
              >
                Or Chat on WhatsApp
              </a>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
