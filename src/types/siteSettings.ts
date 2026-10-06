export interface SiteSettings {
  // Branding
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  light_logo_url: string;
  dark_logo_url: string;
  footer_logo_url: string;
  social_share_image_url: string;
  
  // Theme Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  card_background_color: string;
  text_color: string;
  heading_color: string;
  muted_text_color: string;
  border_color: string;
  button_color: string;
  button_hover_color: string;
  header_background_color: string;
  footer_background_color: string;
  
  // Typography
  font_heading: string;
  font_body: string;
  font_button: string;
  font_size_base: string;
  heading_weight: string;
  body_weight: string;
  letter_spacing: string;
  
  // Contact & Business
  business_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  google_maps_url: string;
  business_hours: string;
  enable_contact_form: boolean;
  enable_whatsapp_button: boolean;
  
  // Social Media
  instagram_url: string;
  instagram_handle: string;
  facebook_url: string;
  youtube_url: string;
  pinterest_url: string;
  twitter_url: string;
  linkedin_url: string;
  
  // E-commerce
  currency: string;
  shipping_fee: string;
  free_shipping_minimum: string;
  
  // Inquiry & Booking
  enable_inquiries: boolean;
  enable_booking: boolean;
  inquiry_success_message: string;
  booking_success_message: string;
  default_inquiry_status: string;
  booking_notice: string;
  
  // Footer
  footer_about_text: string;
  copyright_text: string;
  show_footer_quick_links: boolean;
  show_footer_social: boolean;
  show_footer_contact: boolean;
  
  // Header
  enable_sticky_header: boolean;
  show_search: boolean;
  show_wishlist: boolean;
  show_cart: boolean;
  show_login: boolean;
  
  // Homepage
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image_url: string;
  hero_background_url: string;
  hero_primary_button_text: string;
  hero_primary_button_link: string;
  hero_secondary_button_text: string;
  hero_secondary_button_link: string;
  show_hero_section: boolean;
  
  // Metadata
  updated_at: string;
}

export const defaultSiteSettings: SiteSettings = {
  // Branding
  site_name: 'Mimiko Studio',
  site_tagline: 'Paint ♥ Create ♥ Be You',
  logo_url: '',
  favicon_url: '',
  light_logo_url: '',
  dark_logo_url: '',
  footer_logo_url: '',
  social_share_image_url: '',
  
  // Theme Colors
  primary_color: '#D5AA64',
  secondary_color: '#6B3E28',
  accent_color: '#F2A0B4',
  background_color: '#FFF5E9',
  card_background_color: '#FFFCF7',
  text_color: '#4B2818',
  heading_color: '#4B2818',
  muted_text_color: '#6B3E28',
  border_color: '#EAC69C',
  button_color: '#4B2818',
  button_hover_color: '#6B3E28',
  header_background_color: '#FFF5E9',
  footer_background_color: '#4B2818',
  
  // Typography
  font_heading: 'Cormorant Garamond',
  font_body: 'Inter',
  font_button: 'Montserrat',
  font_size_base: '16px',
  heading_weight: '500',
  body_weight: '400',
  letter_spacing: '0.02em',
  
  // Contact & Business
  business_name: 'Mimiko Studio',
  phone: '+91 7874291924',
  whatsapp: '+917874291924',
  email: 'hello@mimikostudio.com',
  address: '',
  google_maps_url: '',
  business_hours: 'Mon-Sat: 10 AM - 7 PM',
  enable_contact_form: true,
  enable_whatsapp_button: true,
  
  // Social Media
  instagram_url: 'https://www.instagram.com/mimiko.studio24/',
  instagram_handle: '@mimiko.studio24',
  facebook_url: '',
  youtube_url: '',
  pinterest_url: '',
  twitter_url: '',
  linkedin_url: '',
  
  // E-commerce
  currency: 'INR',
  shipping_fee: '99',
  free_shipping_minimum: '1999',
  
  // Inquiry & Booking
  enable_inquiries: true,
  enable_booking: true,
  inquiry_success_message: 'Your creative request has been received! Our studio will review your idea and contact you with pricing and availability.',
  booking_success_message: 'Your appointment request has been submitted. We\'ll confirm your appointment via WhatsApp within 24 hours.',
  default_inquiry_status: 'new',
  booking_notice: 'Please book at least 24 hours in advance.',
  
  // Footer
  footer_about_text: 'Handcrafted fabric art, thoughtfully painted and uniquely designed for you. Each piece tells a story of creativity and passion.',
  copyright_text: '© 2024 Mimiko Studio | Fabric Art. All rights reserved.',
  show_footer_quick_links: true,
  show_footer_social: true,
  show_footer_contact: true,
  
  // Header
  enable_sticky_header: true,
  show_search: true,
  show_wishlist: true,
  show_cart: true,
  show_login: true,
  
  // Homepage
  hero_title: 'Where Art Meets Elegance.',
  hero_subtitle: 'Hand-Painted Creations, Made With Love.',
  hero_description: 'Explore the beauty of personalized fabric art, thoughtfully designed to express your unique style.',
  hero_image_url: '',
  hero_background_url: '',
  hero_primary_button_text: '✨ Explore Our Collection',
  hero_primary_button_link: '/collections',
  hero_secondary_button_text: '🎨 Create Your Own Design',
  hero_secondary_button_link: '/custom-creations',
  show_hero_section: true,
  
  // Metadata
  updated_at: new Date().toISOString(),
};
