import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { createWhatsAppLink, generateReferenceNumber } from '../lib/supabase';

const appointmentTypes = [
  { value: 'custom_design_consultation', label: 'Custom Design Consultation' },
  { value: 'wedding_festive_orders', label: 'Wedding & Festive Orders' },
  { value: 'bulk_order_discussion', label: 'Bulk Order Discussion' },
  { value: 'product_inquiry', label: 'Product Inquiry' },
  { value: 'general_consultation', label: 'General Consultation' },
];

const timeSlots = [
  '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export default function BookAppointment() {
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', appointmentType: '',
    date: '', time: '', description: '', communicationMethod: 'whatsapp',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = generateReferenceNumber('APT');
    setReferenceNumber(ref);
    setSubmitted(true);
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-champagne/10 flex items-center justify-center">
            <CheckCircle size={40} className="text-champagne" />
          </div>
          <h1 className="font-heading text-3xl font-light text-espresso mb-4">Appointment Requested!</h1>
          <p className="text-espresso/60 mb-2">Your appointment request has been submitted.</p>
          <p className="text-sm text-espresso/40 mb-6">Reference: <span className="font-medium text-champagne">{referenceNumber}</span></p>
          <div className="bg-pearl border border-beige/30 rounded-sm p-6 mb-8 text-left">
            <p className="text-sm text-espresso/70 mb-3">
              <strong>Appointment Details:</strong><br />
              Date: {formData.date}<br />
              Time: {formData.time}<br />
              Type: {appointmentTypes.find(t => t.value === formData.appointmentType)?.label}
            </p>
            <p className="text-sm text-espresso/70">
              We'll confirm your appointment via WhatsApp within 24 hours. You'll receive a confirmation with the meeting link or address.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={createWhatsAppLink(`Hi! I just booked an appointment. Reference: ${referenceNumber}. Date: ${formData.date}, Time: ${formData.time}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury-filled flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> Confirm via WhatsApp
            </a>
            <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', appointmentType: '', date: '', time: '', description: '', communicationMethod: 'whatsapp' }); }} className="btn-luxury">
              Book Another
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
          <span className="text-champagne text-xs font-label tracking-[0.3em] uppercase">Connect</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-pearl mt-4 mb-6">
            Let's Create Something<br />
            <span className="italic text-champagne">Beautiful Together</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-pearl/60 max-w-2xl mx-auto">
            Book a consultation to discuss your custom fabric art project. We'll help you bring your vision to life.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-ivory">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-pearl border border-beige/20 rounded-sm p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Appointment Type *</label>
                <select name="appointmentType" value={formData.appointmentType} onChange={handleChange} required className="select-luxury">
                  <option value="">Select type</option>
                  {appointmentTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">
                  <Calendar size={12} className="inline mr-1" /> Preferred Date *
                </label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required min={minDate} className="input-luxury" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">
                  <Clock size={12} className="inline mr-1" /> Preferred Time *
                </label>
                <select name="time" value={formData.time} onChange={handleChange} required className="select-luxury">
                  <option value="">Select time</option>
                  {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Project Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="textarea-luxury" placeholder="Tell us about your project, what you'd like to discuss, or any questions you have..." />
            </div>

            <div className="mt-6">
              <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Preferred Communication</label>
              <div className="flex gap-4">
                {['whatsapp', 'video_call', 'in_person'].map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="communicationMethod"
                      value={method}
                      checked={formData.communicationMethod === method}
                      onChange={handleChange}
                      className="accent-champagne"
                    />
                    <span className="text-sm text-espresso/70 capitalize">{method.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-champagne/5 border border-champagne/10 rounded-sm">
              <p className="text-xs text-espresso/60">
                <Calendar size={14} className="inline mr-2 text-champagne" />
                Your appointment will be confirmed via WhatsApp within 24 hours. We'll send you the meeting details or address.
              </p>
            </div>

            <div className="mt-8">
              <button type="submit" className="btn-luxury-filled w-full">
                Request Appointment
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
