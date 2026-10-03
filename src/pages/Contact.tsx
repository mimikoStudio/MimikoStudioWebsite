import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { INSTAGRAM_URL, WHATSAPP_URL, createWhatsAppLink } from '../lib/supabase';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-chocolate to-coffee relative">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(213,170,100,0.3) 0%, transparent 60%)`
        }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-label tracking-[0.3em] uppercase">💌 Reach Out</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-light text-ivory mt-4 mb-6">Contact Us</h1>
          <div className="gold-divider w-24 mx-auto mb-6" />
          <p className="text-ivory/60 max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question, a custom order idea, or just want to say hello.
          </p>
        </div>
      </section>

      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-heading text-2xl font-light text-espresso mb-8">Get in Touch</h2>
              
              <div className="space-y-6">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-pearl border border-beige/20 rounded-sm hover:border-champagne/30 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-champagne/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-champagne" />
                  </div>
                  <div>
                    <p className="text-xs font-label tracking-wider uppercase text-espresso/50 mb-1">WhatsApp</p>
                    <p className="text-sm text-espresso group-hover:text-champagne transition-colors">+91 7874291924</p>
                  </div>
                </a>

                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-pearl border border-beige/20 rounded-sm hover:border-champagne/30 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-champagne/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-champagne">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-label tracking-wider uppercase text-espresso/50 mb-1">Instagram</p>
                    <p className="text-sm text-espresso group-hover:text-champagne transition-colors">@mimiko.studio24</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 bg-pearl border border-beige/20 rounded-sm">
                  <div className="w-10 h-10 rounded-full bg-champagne/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-champagne" />
                  </div>
                  <div>
                    <p className="text-xs font-label tracking-wider uppercase text-espresso/50 mb-1">Email</p>
                    <p className="text-sm text-espresso">hello@mimikostudio.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-pearl border border-beige/20 rounded-sm">
                  <div className="w-10 h-10 rounded-full bg-champagne/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-champagne" />
                  </div>
                  <div>
                    <p className="text-xs font-label tracking-wider uppercase text-espresso/50 mb-1">Working Hours</p>
                    <p className="text-sm text-espresso">Mon - Sat: 10 AM - 7 PM</p>
                    <p className="text-sm text-espresso/60">Sunday: By appointment</p>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp */}
              <div className="mt-8 p-6 bg-gradient-to-br from-espresso to-chocolate rounded-sm text-center">
                <p className="text-pearl/80 text-sm mb-4">Need a quick response?</p>
                <a
                  href={createWhatsAppLink('Hi! I have a question about Mimiko Studio.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxury-filled !py-3 inline-flex items-center gap-2"
                >
                  <MessageCircle size={14} /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-pearl border border-beige/20 rounded-sm p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-champagne/10 flex items-center justify-center">
                    <Send size={24} className="text-champagne" />
                  </div>
                  <h3 className="font-heading text-2xl text-espresso mb-4">Message Sent!</h3>
                  <p className="text-espresso/60 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }} className="btn-luxury">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-pearl border border-beige/20 rounded-sm p-8 sm:p-12">
                  <h2 className="font-heading text-2xl font-light text-espresso mb-8">Send us a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Name *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required className="input-luxury" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Email *</label>
                      <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required className="input-luxury" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Subject *</label>
                    <input type="text" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} required className="input-luxury" placeholder="How can we help?" />
                  </div>
                  <div className="mb-8">
                    <label className="block text-xs font-label tracking-wider uppercase text-espresso/70 mb-2">Message *</label>
                    <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} required className="textarea-luxury" placeholder="Tell us more..." />
                  </div>
                  <button type="submit" className="btn-luxury-filled w-full flex items-center justify-center gap-2">
                    <Send size={14} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
