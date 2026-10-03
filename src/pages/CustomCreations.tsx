import { useState } from 'react';
import { Upload, Palette, CheckCircle, MessageCircle, Eye } from 'lucide-react';
import { createWhatsAppLink, generateReferenceNumber, isSupabaseConfigured } from '../lib/supabase';
import { submitInquiry } from '../lib/dataService';

const designStyles = [
  { value: 'Floral', emoji: '🌸' },
  { value: 'Nature-Inspired', emoji: '🌿' },
  { value: 'Minimalist', emoji: '✨' },
  { value: 'Abstract', emoji: '🎨' },
  { value: 'Traditional', emoji: '🪷' },
  { value: 'Personalized', emoji: '💖' },
  { value: 'Colorful', emoji: '🌈' },
  { value: 'Artistic', emoji: '🦋' },
];

const productCategories = ['Clothing', 'Bags', 'Home Decor', 'Accessories', 'Gifts', 'Small Creations'];
const budgetRanges = ['Under ₹500', '₹500 - ₹1,000', '₹1,000 - ₹2,000', '₹2,000 - ₹5,000', '₹5,000+'];

const colorOptions = [
  { name: 'Blush Pink', color: '#F2A0B4' },
  { name: 'Rose', color: '#E985A1' },
  { name: 'Sky Blue', color: '#79B8E8' },
  { name: 'Sage Green', color: '#82986C' },
  { name: 'Gold', color: '#D5AA64' },
  { name: 'Chocolate', color: '#4B2818' },
  { name: 'Ivory', color: '#FFF5E9' },
  { name: 'Cream', color: '#F9EBDD' },
];

export default function CustomCreations() {
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', productCategory: '', productType: '',
    fabricPreference: '', preferredColors: '', designStyle: '', customText: '',
    size: '', quantity: '1', budget: '', preferredDate: '', instructions: '',
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    
    const ref = generateReferenceNumber('CUS');
    
    // Prepare inquiry data
    const inquiryData = {
      reference_number: ref,
      customer_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      product_category: formData.productCategory,
      product_type: formData.productType,
      fabric_preference: formData.fabricPreference,
      preferred_colors: formData.preferredColors,
      design_style: formData.designStyle,
      custom_text: formData.customText,
      size: formData.size,
      quantity: parseInt(formData.quantity) || 1,
      budget: formData.budget,
      preferred_date: formData.preferredDate || null,
      reference_image_urls: imagePreview ? [imagePreview] : [],
      instructions: formData.instructions,
      status: 'new' as const,
    };

    // Submit to Supabase
    const result = await submitInquiry(inquiryData);
    
    if (result.success) {
      setReferenceNumber(result.referenceNumber || ref);
      setSubmitted(true);
    } else {
      setSubmitError(result.error || 'Failed to submit. Please try again.');
    }
    
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gold/10 flex items-center justify-center">
            <CheckCircle size={40} className="text-gold" />
          </div>
          <h1 className="font-heading text-3xl font-light text-chocolate mb-4">✅ Request Submitted!</h1>
          <p className="text-coffee/60 mb-2">Your creative request has been received!</p>
          <p className="text-sm text-coffee/40 mb-6">Reference: <span className="font-medium text-gold">{referenceNumber}</span></p>
          <div className="bg-pearl border border-beige/30 rounded-sm p-6 mb-8 text-left">
            <p className="text-sm text-coffee/70 mb-4">
              <strong>Our studio will review your idea and contact you with pricing and availability.</strong>
            </p>
            <p className="text-sm text-coffee/70">
              You can also reach us directly on WhatsApp for faster communication.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={createWhatsAppLink(`Hi! I just submitted a custom creation request. Reference: ${referenceNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2"
            >
              💬 Chat on WhatsApp
            </a>
            <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', productCategory: '', productType: '', fabricPreference: '', preferredColors: '', designStyle: '', customText: '', size: '', quantity: '1', budget: '', preferredDate: '', instructions: '' }); setImagePreview(null); setReferenceImage(null); }} className="btn-secondary">
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
      <section className="py-24 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">✨ Personalize</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">
            Your Imagination,<br />
            <span className="italic text-gold">Our Artistry</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
            Turn your creative ideas into beautifully hand-painted fabric creations.
          </p>
        </div>
      </section>

      {/* Design Style Selection */}
      <section className="py-12 bg-cream/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-heading text-xl text-chocolate text-center mb-6">Choose Your Design Inspiration</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {designStyles.map(style => (
              <button
                key={style.value}
                onClick={() => setFormData(prev => ({ ...prev, designStyle: style.value }))}
                className={`px-5 py-3 rounded-sm border text-sm font-label tracking-wider transition-all duration-300 ${
                  formData.designStyle === style.value
                    ? 'bg-gold border-gold text-white shadow-luxury'
                    : 'border-beige text-coffee hover:border-gold hover:text-gold'
                }`}
              >
                {style.emoji} {style.value}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Preview */}
      <section className="py-16 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-pearl border border-beige/20 rounded-sm p-8 sm:p-10 shadow-luxury">
                <h3 className="font-heading text-2xl text-chocolate mb-6 flex items-center gap-2">
                  💌 Your Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-luxury" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-luxury" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">WhatsApp Number *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-luxury" placeholder="+91 XXXXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Product Category *</label>
                    <select name="productCategory" value={formData.productCategory} onChange={handleChange} required className="select-luxury">
                      <option value="">Select category</option>
                      {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Product Type *</label>
                    <input type="text" name="productType" value={formData.productType} onChange={handleChange} required className="input-luxury" placeholder="e.g., T-shirt, Tote bag" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Fabric Preference</label>
                    <input type="text" name="fabricPreference" value={formData.fabricPreference} onChange={handleChange} className="input-luxury" placeholder="e.g., Cotton, Silk" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Custom Text/Name</label>
                    <input type="text" name="customText" value={formData.customText} onChange={handleChange} className="input-luxury" placeholder="Text to be painted" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Size</label>
                    <input type="text" name="size" value={formData.size} onChange={handleChange} className="input-luxury" placeholder="e.g., M, XL, Free size" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Quantity</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Budget Range</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} className="select-luxury">
                      <option value="">Select budget</option>
                      {budgetRanges.map(range => <option key={range} value={range}>{range}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Preferred Completion Date</label>
                    <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">📷 Reference Image</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="reference-upload" />
                      <label htmlFor="reference-upload" className="input-luxury flex items-center gap-3 cursor-pointer hover:border-gold transition-colors">
                        <Upload size={16} className="text-gold" />
                        <span className="text-sm text-coffee/50 truncate">{referenceImage ? referenceImage.name : 'Upload reference image'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mt-6">
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-3">🎨 Preferred Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          preferredColors: prev.preferredColors.includes(c.name)
                            ? prev.preferredColors.replace(c.name, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
                            : prev.preferredColors ? `${prev.preferredColors}, ${c.name}` : c.name
                        }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs transition-all ${
                          formData.preferredColors.includes(c.name)
                            ? 'border-gold bg-gold/10 text-chocolate'
                            : 'border-beige text-coffee/60 hover:border-gold'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-chocolate/20" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">📝 Additional Instructions</label>
                  <textarea name="instructions" value={formData.instructions} onChange={handleChange} className="textarea-luxury" placeholder="Tell us more about your vision, any specific requirements, or inspiration..." />
                </div>

                <div className="mt-6 p-4 bg-gold/5 border border-gold/15 rounded-sm">
                  <p className="text-xs text-coffee/60">
                    <Palette size={14} className="inline mr-2 text-gold" />
                    <strong>Note:</strong> The final quotation and delivery date will be confirmed after our team reviews your request.
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button type="submit" className="btn-primary flex-1">
                    ✨ Submit Request
                  </button>
                  <a
                    href={createWhatsAppLink('Hi! I would like to discuss a custom fabric art creation.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex-1 text-center"
                  >
                    💬 Or Chat on WhatsApp
                  </a>
                </div>
              </form>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-pearl border border-beige/20 rounded-sm p-6 shadow-luxury">
                  <h3 className="font-heading text-lg text-chocolate mb-4 flex items-center gap-2">
                    <Eye size={16} className="text-gold" /> Design Preview
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Preview Image */}
                    <div className="aspect-square bg-gradient-to-br from-cream to-beige/30 rounded-sm flex items-center justify-center overflow-hidden relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Reference" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <span className="text-5xl block mb-2">🎨</span>
                          <p className="text-xs text-coffee/40">Upload a reference image</p>
                        </div>
                      )}
                    </div>

                    {/* Selected Options */}
                    <div className="space-y-2">
                      {formData.designStyle && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-coffee/50">Style:</span>
                          <span className="text-chocolate font-medium">{designStyles.find(s => s.value === formData.designStyle)?.emoji} {formData.designStyle}</span>
                        </div>
                      )}
                      {formData.productCategory && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-coffee/50">Category:</span>
                          <span className="text-chocolate font-medium">{formData.productCategory}</span>
                        </div>
                      )}
                      {formData.productType && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-coffee/50">Product:</span>
                          <span className="text-chocolate font-medium">{formData.productType}</span>
                        </div>
                      )}
                      {formData.customText && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-coffee/50">Text:</span>
                          <span className="text-chocolate font-medium italic">"{formData.customText}"</span>
                        </div>
                      )}
                      {formData.preferredColors && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-coffee/50">Colors:</span>
                          <span className="text-chocolate font-medium text-right text-xs max-w-[140px]">{formData.preferredColors}</span>
                        </div>
                      )}
                      {formData.budget && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-coffee/50">Budget:</span>
                          <span className="text-chocolate font-medium">{formData.budget}</span>
                        </div>
                      )}
                    </div>

                    {!formData.designStyle && !formData.productCategory && (
                      <p className="text-xs text-coffee/40 text-center italic">
                        Fill in the form to see your design concept preview
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] text-coffee/40 mt-4 text-center italic">
                    * This is a concept preview. The actual handmade artwork may vary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
