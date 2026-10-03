import { useState } from 'react';
import { Calendar, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { createWhatsAppLink, generateReferenceNumber } from '../lib/supabase';
import { submitAppointment } from '../lib/dataService';

const appointmentTypes = [
  { value: 'custom_design_consultation', label: 'Custom Design Consultation', emoji: '🎨' },
  { value: 'wedding_festive_orders', label: 'Wedding & Festive Orders', emoji: '💍' },
  { value: 'bulk_order_discussion', label: 'Bulk Order Discussion', emoji: '📦' },
  { value: 'product_inquiry', label: 'Product Inquiry', emoji: '🛍️' },
  { value: 'general_consultation', label: 'General Consultation', emoji: '💬' },
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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    
    const ref = generateReferenceNumber('APT');
    
    // Parse time to create end_time (1 hour after start)
    const startTime = formData.time;
    const [hourStr, period] = startTime.split(' ');
    let hour = parseInt(hourStr.split(':')[0]);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    const endHour = hour + 1;
    const endTime = `${endHour > 12 ? endHour - 12 : endHour}:00 ${endHour >= 12 ? 'PM' : 'AM'}`;
    
    const appointmentData = {
      reference_number: ref,
      customer_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      appointment_type: formData.appointmentType,
      appointment_date: formData.date,
      start_time: startTime,
      end_time: endTime,
      project_description: formData.description,
      reference_image_urls: [],
      communication_method: formData.communicationMethod,
      status: 'requested' as const,
    };

    const result = await submitAppointment(appointmentData);
    
    if (result.success) {
      setReferenceNumber(result.referenceNumber || ref);
      setSubmitted(true);
    } else {
      setSubmitError(result.error || 'Failed to submit. Please try again.');
    }
    
    setSubmitting(false);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gold/10 flex items-center justify-center">
            <CheckCircle size={40} className="text-gold" />
          </div>
          <h1 className="font-heading text-3xl font-light text-chocolate mb-4">✅ Appointment Requested!</h1>
          <p className="text-coffee/60 mb-2">Your appointment request has been submitted.</p>
          <p className="text-sm text-coffee/40 mb-6">Reference: <span className="font-medium text-gold">{referenceNumber}</span></p>
          <div className="bg-pearl border border-beige/30 rounded-sm p-6 mb-8 text-left">
            <p className="text-sm text-coffee/70 mb-3">
              <strong>📅 Appointment Details:</strong><br />
              Date: {formData.date}<br />
              Time: {formData.time}<br />
              Type: {appointmentTypes.find(t => t.value === formData.appointmentType)?.emoji} {appointmentTypes.find(t => t.value === formData.appointmentType)?.label}
            </p>
            <p className="text-sm text-coffee/70">
              We'll confirm your appointment via WhatsApp within 24 hours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={createWhatsAppLink(`Hi! I just booked an appointment. Reference: ${referenceNumber}. Date: ${formData.date}, Time: ${formData.time}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2"
            >
              💬 Confirm via WhatsApp
            </a>
            <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', appointmentType: '', date: '', time: '', description: '', communicationMethod: 'whatsapp' }); }} className="btn-secondary">
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
      <section className="py-24 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">📅 Connect</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">
            Book Your Creative<br />
            <span className="italic text-gold">Consultation</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
            Schedule a consultation to discuss your custom fabric art project. We'll help you bring your vision to life.
          </p>
        </div>
      </section>

      {/* Appointment Types */}
      <section className="py-12 bg-cream/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-heading text-xl text-chocolate text-center mb-6">Select Consultation Type</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {appointmentTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFormData(prev => ({ ...prev, appointmentType: type.value }))}
                className={`px-5 py-3 rounded-sm border text-sm font-label tracking-wider transition-all duration-300 ${
                  formData.appointmentType === type.value
                    ? 'bg-gold border-gold text-white shadow-luxury'
                    : 'border-beige text-coffee hover:border-gold hover:text-gold'
                }`}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-ivory">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-pearl border border-beige/20 rounded-sm p-8 sm:p-12 shadow-luxury">
            <h3 className="font-heading text-2xl text-chocolate mb-8 flex items-center gap-2">
              📅 Schedule Your Visit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  <Calendar size={12} className="inline mr-1" /> Preferred Date *
                </label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required min={minDate} className="input-luxury" />
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                  <Clock size={12} className="inline mr-1" /> Preferred Time *
                </label>
                <select name="time" value={formData.time} onChange={handleChange} required className="select-luxury">
                  <option value="">Select time</option>
                  {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">Communication Method</label>
                <select name="communicationMethod" value={formData.communicationMethod} onChange={handleChange} className="select-luxury">
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="video_call">📹 Video Call</option>
                  <option value="in_person">📍 In Person</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">📝 Project Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="textarea-luxury" placeholder="Tell us about your project, what you'd like to discuss, or any questions you have..." />
            </div>

            <div className="mt-6 p-4 bg-gold/5 border border-gold/15 rounded-sm">
              <p className="text-xs text-coffee/60">
                <Calendar size={14} className="inline mr-2 text-gold" />
                Your appointment will be confirmed via WhatsApp within 24 hours. We'll send you the meeting details.
              </p>
            </div>

            <div className="mt-8">
              <button type="submit" className="btn-primary w-full">
                📅 Request Appointment
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
