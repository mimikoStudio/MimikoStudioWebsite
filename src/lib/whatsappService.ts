import { supabase } from '../lib/supabase';
import { 
  WhatsAppTemplate, 
  WhatsAppTemplateKey, 
  WhatsAppTemplateVariables,
  WhatsAppMessageLog,
  WhatsAppSettings
} from '../types/whatsapp';

// Default WhatsApp settings
const defaultWhatsAppSettings: WhatsAppSettings = {
  business_whatsapp_number: '+917874291924',
  country_code: '+91',
  enable_whatsapp: true,
  enable_customer_messages: true,
  enable_admin_notifications: true,
  enable_order_notifications: true,
  enable_inquiry_notifications: true,
  enable_booking_notifications: true,
  enable_invoice_messages: true,
  enable_payment_messages: true,
  enable_status_messages: true,
  default_greeting: 'Hello 👋',
  default_footer: 'Thank you for choosing {{business_name}} 💎',
  business_signature: '{{business_name}} Team',
};

// Default templates
const defaultTemplates: Record<WhatsAppTemplateKey, Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>> = {
  ORDER_CONFIRMATION: {
    template_key: 'ORDER_CONFIRMATION',
    template_name: 'Order Confirmation',
    description: 'Sent to customer when order is confirmed',
    message_body: `{{default_greeting}} {{customer_name}}!

Thank you for your order with {{business_name}} 💎

📦 Order Details:
Order Number: {{order_number}}
Order Date: {{order_date}}
Total Amount: {{currency}}{{order_total}}
Payment Status: {{payment_status}}

{{items_summary}}

We will keep you updated about your order status.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  ORDER_RECEIVED: {
    template_key: 'ORDER_RECEIVED',
    template_name: 'Order Received',
    description: 'Sent to customer when order is received',
    message_body: `{{default_greeting}} {{customer_name}}!

We have received your order {{order_number}} ✅

Total: {{currency}}{{order_total}}

We will process your order soon and keep you updated.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  ORDER_STATUS_UPDATE: {
    template_key: 'ORDER_STATUS_UPDATE',
    template_name: 'Order Status Update',
    description: 'Sent to customer when order status changes',
    message_body: `{{default_greeting}} {{customer_name}}!

Your order {{order_number}} has been updated.

📊 Current Status: {{order_status}}

{{#if tracking_number}}
Tracking Number: {{tracking_number}}
Track: {{tracking_url}}
{{/if}}

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  PRODUCT_INQUIRY: {
    template_key: 'PRODUCT_INQUIRY',
    template_name: 'Product Inquiry',
    description: 'Sent when customer inquires about a product',
    message_body: `{{default_greeting}}

I am interested in this product:

🛍️ Product: {{product_name}}
💰 Price: {{currency}}{{product_price}}
🔗 Link: {{product_url}}

I would like to know more details.

Thank you!`,
    recipient_type: 'BUSINESS',
    is_active: true,
  },
  INQUIRY_RECEIVED: {
    template_key: 'INQUIRY_RECEIVED',
    template_name: 'Inquiry Received',
    description: 'Sent to customer when inquiry is submitted',
    message_body: `{{default_greeting}} {{customer_name}}!

Thank you for your inquiry with {{business_name}} 💎

📋 Inquiry Details:
Inquiry ID: {{inquiry_id}}
Type: {{inquiry_type}}
Subject: {{inquiry_subject}}

Message:
{{inquiry_message}}

We will review your inquiry and get back to you soon.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  INQUIRY_ADMIN_NOTIFICATION: {
    template_key: 'INQUIRY_ADMIN_NOTIFICATION',
    template_name: 'Admin Inquiry Notification',
    description: 'Sent to admin when new inquiry is received',
    message_body: `🔔 New Customer Inquiry

👤 Name: {{customer_name}}
📞 Phone: {{customer_phone}}
📧 Email: {{customer_email}}

📋 Type: {{inquiry_type}}
📝 Message:
{{inquiry_message}}

🆔 Inquiry ID: {{inquiry_id}}
🔗 View: {{inquiry_url}}`,
    recipient_type: 'ADMIN',
    is_active: true,
  },
  BOOKING_REQUEST: {
    template_key: 'BOOKING_REQUEST',
    template_name: 'Booking Request',
    description: 'Sent to customer when booking is requested',
    message_body: `{{default_greeting}} {{customer_name}}!

Your booking request has been received ✅

📅 Booking Details:
Date: {{booking_date}}
Time: {{booking_time}}
Service: {{service_name}}
Status: {{booking_status}}

{{#if booking_notes}}
Notes: {{booking_notes}}
{{/if}}

We will confirm your booking soon.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  BOOKING_CONFIRMATION: {
    template_key: 'BOOKING_CONFIRMATION',
    template_name: 'Booking Confirmation',
    description: 'Sent to customer when booking is confirmed',
    message_body: `{{default_greeting}} {{customer_name}}!

Your booking has been confirmed ✅

📅 Date: {{booking_date}}
⏰ Time: {{booking_time}}
🎯 Service: {{service_name}}

We look forward to serving you!

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  CUSTOM_ORDER_REQUEST: {
    template_key: 'CUSTOM_ORDER_REQUEST',
    template_name: 'Custom Order Request',
    description: 'Sent when customer requests custom order',
    message_body: `💎 Custom Order Inquiry

{{default_greeting}} {{business_name}},

I would like to request a custom order.

👤 Customer: {{customer_name}}
📞 Phone: {{customer_phone}}

📋 Requirements:
{{inquiry_message}}

{{#if booking_date}}
📅 Preferred Date: {{booking_date}}
{{/if}}

{{#if budget}}
💰 Budget: {{budget}}
{{/if}}

Please contact me regarding this request.

Thank you!`,
    recipient_type: 'BUSINESS',
    is_active: true,
  },
  CONTACT_FORM: {
    template_key: 'CONTACT_FORM',
    template_name: 'Contact Form',
    description: 'Sent when customer uses contact form',
    message_body: `{{default_greeting}} {{business_name}}!

I would like to contact you.

👤 Name: {{customer_name}}
📞 Phone: {{customer_phone}}
📧 Email: {{customer_email}}

📝 Message:
{{inquiry_message}}

Thank you!`,
    recipient_type: 'BUSINESS',
    is_active: true,
  },
  ADMIN_NEW_ORDER: {
    template_key: 'ADMIN_NEW_ORDER',
    template_name: 'Admin New Order Notification',
    description: 'Sent to admin when new order is placed',
    message_body: `🔔 New Order Received

👤 Customer: {{customer_name}}
📞 Phone: {{customer_phone}}

📦 Order: {{order_number}}
💰 Total: {{currency}}{{order_total}}
💳 Payment: {{payment_status}}

{{items_summary}}

🔗 View Order: {{order_url}}`,
    recipient_type: 'ADMIN',
    is_active: true,
  },
  ADMIN_NEW_INQUIRY: {
    template_key: 'ADMIN_NEW_INQUIRY',
    template_name: 'Admin New Inquiry Notification',
    description: 'Sent to admin when new inquiry is received',
    message_body: `🔔 New Customer Inquiry

👤 Name: {{customer_name}}
📞 Phone: {{customer_phone}}
📧 Email: {{customer_email}}

📋 Type: {{inquiry_type}}
📝 Message:
{{inquiry_message}}

🆔 Inquiry ID: {{inquiry_id}}
🔗 View: {{inquiry_url}}`,
    recipient_type: 'ADMIN',
    is_active: true,
  },
  ADMIN_NEW_BOOKING: {
    template_key: 'ADMIN_NEW_BOOKING',
    template_name: 'Admin New Booking Notification',
    description: 'Sent to admin when new booking is requested',
    message_body: `🔔 New Booking Request

👤 Customer: {{customer_name}}
📞 Phone: {{customer_phone}}

📅 Date: {{booking_date}}
⏰ Time: {{booking_time}}
🎯 Service: {{service_name}}

📝 Notes:
{{booking_notes}}

🔗 View Booking: {{order_url}}`,
    recipient_type: 'ADMIN',
    is_active: true,
  },
  // Add remaining templates with defaults
  ORDER_SHIPPED: {
    template_key: 'ORDER_SHIPPED',
    template_name: 'Order Shipped',
    description: 'Sent to customer when order is shipped',
    message_body: `{{default_greeting}} {{customer_name}}!

Your order {{order_number}} has been shipped 🚚

Tracking Number: {{tracking_number}}
Track: {{tracking_url}}

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  ORDER_DELIVERED: {
    template_key: 'ORDER_DELIVERED',
    template_name: 'Order Delivered',
    description: 'Sent to customer when order is delivered',
    message_body: `{{default_greeting}} {{customer_name}}!

Your order {{order_number}} has been delivered ✅

Thank you for shopping with us!

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  ORDER_CANCELLED: {
    template_key: 'ORDER_CANCELLED',
    template_name: 'Order Cancelled',
    description: 'Sent to customer when order is cancelled',
    message_body: `{{default_greeting}} {{customer_name}}!

Your order {{order_number}} has been cancelled.

If you have any questions, please contact us.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  BOOKING_STATUS_UPDATE: {
    template_key: 'BOOKING_STATUS_UPDATE',
    template_name: 'Booking Status Update',
    description: 'Sent to customer when booking status changes',
    message_body: `{{default_greeting}} {{customer_name}}!

Your booking has been updated.

📅 Date: {{booking_date}}
⏰ Time: {{booking_time}}
📊 Status: {{booking_status}}

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  ADMIN_CUSTOM_ORDER: {
    template_key: 'ADMIN_CUSTOM_ORDER',
    template_name: 'Admin Custom Order Notification',
    description: 'Sent to admin when custom order is requested',
    message_body: `💎 New Custom Order Request

👤 Customer: {{customer_name}}
📞 Phone: {{customer_phone}}

📋 Requirements:
{{inquiry_message}}

🆔 Inquiry ID: {{inquiry_id}}
🔗 View: {{inquiry_url}}`,
    recipient_type: 'ADMIN',
    is_active: true,
  },
  PAYMENT_RECEIVED: {
    template_key: 'PAYMENT_RECEIVED',
    template_name: 'Payment Received',
    description: 'Sent to customer when payment is received',
    message_body: `💳 Payment Confirmation

{{default_greeting}} {{customer_name}}!

We have received your payment.

Order: {{order_number}}
Amount: {{currency}}{{order_total}}
Method: {{payment_method}}
Status: {{payment_status}}

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  PAYMENT_PENDING: {
    template_key: 'PAYMENT_PENDING',
    template_name: 'Payment Pending',
    description: 'Sent to customer when payment is pending',
    message_body: `💳 Payment Pending

{{default_greeting}} {{customer_name}}!

Your payment for order {{order_number}} is pending.

Amount: {{currency}}{{order_total}}

Please complete the payment to process your order.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  PAYMENT_FAILED: {
    template_key: 'PAYMENT_FAILED',
    template_name: 'Payment Failed',
    description: 'Sent to customer when payment fails',
    message_body: `💳 Payment Failed

{{default_greeting}} {{customer_name}}!

Your payment for order {{order_number}} has failed.

Amount: {{currency}}{{order_total}}

Please try again or contact us for assistance.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  GENERAL_ENQUIRY: {
    template_key: 'GENERAL_ENQUIRY',
    template_name: 'General Enquiry',
    description: 'Sent for general enquiries',
    message_body: `{{default_greeting}} {{business_name}}!

{{inquiry_message}}

Thank you!`,
    recipient_type: 'BUSINESS',
    is_active: true,
  },
  CUSTOMER_WELCOME: {
    template_key: 'CUSTOMER_WELCOME',
    template_name: 'Customer Welcome',
    description: 'Sent to welcome new customers',
    message_body: `{{default_greeting}} {{customer_name}}!

Welcome to {{business_name}} 💎

We are delighted to have you as our customer.

Explore our collection: {{website_url}}

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
  CUSTOMER_FOLLOW_UP: {
    template_key: 'CUSTOMER_FOLLOW_UP',
    template_name: 'Customer Follow Up',
    description: 'Sent to follow up with customers',
    message_body: `{{default_greeting}} {{customer_name}}!

We hope you are enjoying your purchase from {{business_name}} 💎

If you have any questions or need assistance, please don't hesitate to contact us.

{{default_footer}}`,
    recipient_type: 'CUSTOMER',
    is_active: true,
  },
};

/**
 * Get WhatsApp settings from database
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'whatsapp_settings')
      .single();

    if (error || !data) {
      return defaultWhatsAppSettings;
    }

    return { ...defaultWhatsAppSettings, ...JSON.parse(data.setting_value) };
  } catch (error) {
    console.error('Error loading WhatsApp settings:', error);
    return defaultWhatsAppSettings;
  }
}

/**
 * Save WhatsApp settings to database
 */
export async function saveWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  try {
    await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'whatsapp_settings',
        setting_value: JSON.stringify(settings),
      }, { onConflict: 'setting_key' });
  } catch (error) {
    console.error('Error saving WhatsApp settings:', error);
    throw error;
  }
}

/**
 * Get all WhatsApp templates from database
 */
export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .order('template_key');

    if (error) {
      console.error('Error loading templates:', error);
      // Return default templates if table doesn't exist
      return Object.values(defaultTemplates).map((t, i) => ({
        ...t,
        id: `default-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}

/**
 * Get a specific template by key
 */
export async function getWhatsAppTemplate(key: WhatsAppTemplateKey): Promise<WhatsAppTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('template_key', key)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Return default template if not found
      const defaultTemplate = defaultTemplates[key];
      if (defaultTemplate) {
        return {
          ...defaultTemplate,
          id: `default-${key}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error loading template:', error);
    return null;
  }
}

/**
 * Save a WhatsApp template to database
 */
export async function saveWhatsAppTemplate(template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppTemplate> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_templates')
      .upsert({
        ...template,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'template_key' })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

/**
 * Render template with variables
 */
export function renderWhatsAppTemplate(
  templateBody: string,
  variables: WhatsAppTemplateVariables,
  settings: WhatsAppSettings = defaultWhatsAppSettings
): string {
  let message = templateBody;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, String(value));
    }
  });

  // Replace default variables
  message = message.replace(/\{\{default_greeting\}\}/g, settings.default_greeting);
  message = message.replace(/\{\{default_footer\}\}/g, settings.default_footer);
  message = message.replace(/\{\{business_name\}\}/g, settings.business_whatsapp_number ? 'Our Business' : '');
  message = message.replace(/\{\{business_phone\}\}/g, settings.business_whatsapp_number);
  message = message.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString());
  message = message.replace(/\{\{current_time\}\}/g, new Date().toLocaleTimeString());

  // Clean up any remaining unreplaced variables
  message = message.replace(/\{\{[^}]+\}\}/g, '');

  // Remove empty conditional blocks
  message = message.replace(/\{\{#if[^}]+\}\}[\s\S]*?\{\{\/if\}\}/g, '');

  return message.trim();
}

/**
 * Format phone number for WhatsApp
 */
export function formatWhatsAppPhone(phone: string, countryCode: string = '+91'): string {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with +, use as is
  if (cleaned.startsWith('+')) {
    return cleaned.substring(1); // Remove + for URL
  }

  // If starts with country code, use as is
  if (cleaned.startsWith(countryCode.replace('+', ''))) {
    return cleaned;
  }

  // Otherwise, add country code
  return countryCode.replace('+', '') + cleaned;
}

/**
 * Generate WhatsApp URL
 */
export function generateWhatsAppURL(
  phone: string,
  message: string,
  countryCode: string = '+91'
): string {
  const formattedPhone = formatWhatsAppPhone(phone, countryCode);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Format order items for WhatsApp message
 */
export function formatOrderItemsForWhatsApp(
  items: Array<{ product_name: string; quantity: number; unit_price: number }>,
  currency: string = '₹'
): string {
  if (!items || items.length === 0) return '';

  let summary = '🛍️ Items:\n\n';
  items.forEach((item, index) => {
    summary += `${index + 1}. ${item.product_name}\n`;
    summary += `   Qty: ${item.quantity}\n`;
    summary += `   ${currency}${item.unit_price.toLocaleString()} × ${item.quantity} = ${currency}${(item.unit_price * item.quantity).toLocaleString()}\n\n`;
  });

  return summary;
}

/**
 * Log WhatsApp message
 */
export async function logWhatsAppMessage(
  templateId: string,
  recipientType: WhatsAppTemplate['recipient_type'],
  recipientPhone: string,
  entityType: WhatsAppMessageLog['entity_type'],
  entityId: string,
  messageBody: string,
  status: WhatsAppMessageLog['status'] = 'generated',
  createdBy: string = 'system'
): Promise<void> {
  try {
    await supabase.from('whatsapp_message_logs').insert({
      template_id: templateId,
      recipient_type: recipientType,
      recipient_phone: recipientPhone,
      entity_type: entityType,
      entity_id: entityId,
      message_body: messageBody,
      status,
      created_by: createdBy,
    });
  } catch (error) {
    console.error('Error logging WhatsApp message:', error);
    // Don't throw error - logging is optional
  }
}

/**
 * Get WhatsApp message logs
 */
export async function getWhatsAppMessageLogs(limit: number = 100): Promise<WhatsAppMessageLog[]> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_message_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading message logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading message logs:', error);
    return [];
  }
}

/**
 * Initialize default templates in database
 */
export async function initializeDefaultTemplates(): Promise<void> {
  try {
    const templates = Object.values(defaultTemplates);
    
    for (const template of templates) {
      await supabase
        .from('whatsapp_templates')
        .upsert({
          ...template,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'template_key' });
    }

    console.log('✅ Default WhatsApp templates initialized');
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
}
