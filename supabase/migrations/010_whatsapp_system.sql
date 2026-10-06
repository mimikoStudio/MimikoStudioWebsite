-- ============================================
-- WHATSAPP TEMPLATES AND MESSAGE LOGS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  description TEXT,
  message_body TEXT NOT NULL,
  recipient_type TEXT NOT NULL DEFAULT 'CUSTOMER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create whatsapp_message_logs table
CREATE TABLE IF NOT EXISTS whatsapp_message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
  recipient_type TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_key ON whatsapp_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_active ON whatsapp_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_template ON whatsapp_message_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_entity ON whatsapp_message_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created ON whatsapp_message_logs(created_at);

-- 4. Enable RLS
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Templates: Public can read active, Admin can do all
DROP POLICY IF EXISTS "whatsapp_templates_public_read" ON whatsapp_templates;
CREATE POLICY "whatsapp_templates_public_read" 
ON whatsapp_templates 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "whatsapp_templates_admin_all" ON whatsapp_templates;
CREATE POLICY "whatsapp_templates_admin_all" 
ON whatsapp_templates 
FOR ALL 
USING (true);

-- Message logs: Admin can do all
DROP POLICY IF EXISTS "whatsapp_logs_admin_all" ON whatsapp_message_logs;
CREATE POLICY "whatsapp_logs_admin_all" 
ON whatsapp_message_logs 
FOR ALL 
USING (true);

-- 6. Insert default templates
INSERT INTO whatsapp_templates (template_key, template_name, description, message_body, recipient_type, is_active) VALUES
('ORDER_CONFIRMATION', 'Order Confirmation', 'Sent to customer when order is confirmed', E'{{default_greeting}} {{customer_name}}!\n\nThank you for your order with {{business_name}} 💎\n\n📦 Order Details:\nOrder Number: {{order_number}}\nOrder Date: {{order_date}}\nTotal Amount: {{currency}}{{order_total}}\nPayment Status: {{payment_status}}\n\n{{items_summary}}\n\nWe will keep you updated about your order status.\n\n{{default_footer}}', 'CUSTOMER', true),
('ORDER_RECEIVED', 'Order Received', 'Sent to customer when order is received', E'{{default_greeting}} {{customer_name}}!\n\nWe have received your order {{order_number}} ✅\n\nTotal: {{currency}}{{order_total}}\n\nWe will process your order soon and keep you updated.\n\n{{default_footer}}', 'CUSTOMER', true),
('ORDER_STATUS_UPDATE', 'Order Status Update', 'Sent to customer when order status changes', E'{{default_greeting}} {{customer_name}}!\n\nYour order {{order_number}} has been updated.\n\n📊 Current Status: {{order_status}}\n\n{{#if tracking_number}}\nTracking Number: {{tracking_number}}\nTrack: {{tracking_url}}\n{{/if}}\n\n{{default_footer}}', 'CUSTOMER', true),
('PRODUCT_INQUIRY', 'Product Inquiry', 'Sent when customer inquires about a product', E'{{default_greeting}}\n\nI am interested in this product:\n\n🛍️ Product: {{product_name}}\n💰 Price: {{currency}}{{product_price}}\n🔗 Link: {{product_url}}\n\nI would like to know more details.\n\nThank you!', 'BUSINESS', true),
('INQUIRY_RECEIVED', 'Inquiry Received', 'Sent to customer when inquiry is submitted', E'{{default_greeting}} {{customer_name}}!\n\nThank you for your inquiry with {{business_name}} 💎\n\n📋 Inquiry Details:\nInquiry ID: {{inquiry_id}}\nType: {{inquiry_type}}\nSubject: {{inquiry_subject}}\n\nMessage:\n{{inquiry_message}}\n\nWe will review your inquiry and get back to you soon.\n\n{{default_footer}}', 'CUSTOMER', true),
('INQUIRY_ADMIN_NOTIFICATION', 'Admin Inquiry Notification', 'Sent to admin when new inquiry is received', E'🔔 New Customer Inquiry\n\n👤 Name: {{customer_name}}\n📞 Phone: {{customer_phone}}\n📧 Email: {{customer_email}}\n\n📋 Type: {{inquiry_type}}\n📝 Message:\n{{inquiry_message}}\n\n🆔 Inquiry ID: {{inquiry_id}}\n🔗 View: {{inquiry_url}}', 'ADMIN', true),
('BOOKING_REQUEST', 'Booking Request', 'Sent to customer when booking is requested', E'{{default_greeting}} {{customer_name}}!\n\nYour booking request has been received ✅\n\n📅 Booking Details:\nDate: {{booking_date}}\nTime: {{booking_time}}\nService: {{service_name}}\nStatus: {{booking_status}}\n\n{{#if booking_notes}}\nNotes: {{booking_notes}}\n{{/if}}\n\nWe will confirm your booking soon.\n\n{{default_footer}}', 'CUSTOMER', true),
('BOOKING_CONFIRMATION', 'Booking Confirmation', 'Sent to customer when booking is confirmed', E'{{default_greeting}} {{customer_name}}!\n\nYour booking has been confirmed ✅\n\n📅 Date: {{booking_date}}\n⏰ Time: {{booking_time}}\n🎯 Service: {{service_name}}\n\nWe look forward to serving you!\n\n{{default_footer}}', 'CUSTOMER', true),
('CUSTOM_ORDER_REQUEST', 'Custom Order Request', 'Sent when customer requests custom order', E'💎 Custom Order Inquiry\n\n{{default_greeting}} {{business_name}},\n\nI would like to request a custom order.\n\n👤 Customer: {{customer_name}}\n📞 Phone: {{customer_phone}}\n\n📋 Requirements:\n{{inquiry_message}}\n\n{{#if booking_date}}\n📅 Preferred Date: {{booking_date}}\n{{/if}}\n\n{{#if budget}}\n💰 Budget: {{budget}}\n{{/if}}\n\nPlease contact me regarding this request.\n\nThank you!', 'BUSINESS', true),
('CONTACT_FORM', 'Contact Form', 'Sent when customer uses contact form', E'{{default_greeting}} {{business_name}}!\n\nI would like to contact you.\n\n👤 Name: {{customer_name}}\n📞 Phone: {{customer_phone}}\n📧 Email: {{customer_email}}\n\n📝 Message:\n{{inquiry_message}}\n\nThank you!', 'BUSINESS', true),
('ADMIN_NEW_ORDER', 'Admin New Order Notification', 'Sent to admin when new order is placed', E'🔔 New Order Received\n\n👤 Customer: {{customer_name}}\n📞 Phone: {{customer_phone}}\n\n📦 Order: {{order_number}}\n💰 Total: {{currency}}{{order_total}}\n💳 Payment: {{payment_status}}\n\n{{items_summary}}\n\n🔗 View Order: {{order_url}}', 'ADMIN', true),
('ADMIN_NEW_INQUIRY', 'Admin New Inquiry Notification', 'Sent to admin when new inquiry is received', E'🔔 New Customer Inquiry\n\n👤 Name: {{customer_name}}\n📞 Phone: {{customer_phone}}\n📧 Email: {{customer_email}}\n\n📋 Type: {{inquiry_type}}\n📝 Message:\n{{inquiry_message}}\n\n🆔 Inquiry ID: {{inquiry_id}}\n🔗 View: {{inquiry_url}}', 'ADMIN', true),
('ADMIN_NEW_BOOKING', 'Admin New Booking Notification', 'Sent to admin when new booking is requested', E'🔔 New Booking Request\n\n👤 Customer: {{customer_name}}\n📞 Phone: {{customer_phone}}\n\n📅 Date: {{booking_date}}\n⏰ Time: {{booking_time}}\n🎯 Service: {{service_name}}\n\n📝 Notes:\n{{booking_notes}}\n\n🔗 View Booking: {{order_url}}', 'ADMIN', true),
('ORDER_SHIPPED', 'Order Shipped', 'Sent to customer when order is shipped', E'{{default_greeting}} {{customer_name}}!\n\nYour order {{order_number}} has been shipped 🚚\n\nTracking Number: {{tracking_number}}\nTrack: {{tracking_url}}\n\n{{default_footer}}', 'CUSTOMER', true),
('ORDER_DELIVERED', 'Order Delivered', 'Sent to customer when order is delivered', E'{{default_greeting}} {{customer_name}}!\n\nYour order {{order_number}} has been delivered ✅\n\nThank you for shopping with us!\n\n{{default_footer}}', 'CUSTOMER', true),
('ORDER_CANCELLED', 'Order Cancelled', 'Sent to customer when order is cancelled', E'{{default_greeting}} {{customer_name}}!\n\nYour order {{order_number}} has been cancelled.\n\nIf you have any questions, please contact us.\n\n{{default_footer}}', 'CUSTOMER', true),
('BOOKING_STATUS_UPDATE', 'Booking Status Update', 'Sent to customer when booking status changes', E'{{default_greeting}} {{customer_name}}!\n\nYour booking has been updated.\n\n📅 Date: {{booking_date}}\n⏰ Time: {{booking_time}}\n📊 Status: {{booking_status}}\n\n{{default_footer}}', 'CUSTOMER', true),
('ADMIN_CUSTOM_ORDER', 'Admin Custom Order Notification', 'Sent to admin when custom order is requested', E'💎 New Custom Order Request\n\n👤 Customer: {{customer_name}}\n📞 Phone: {{customer_phone}}\n\n📋 Requirements:\n{{inquiry_message}}\n\n🆔 Inquiry ID: {{inquiry_id}}\n🔗 View: {{inquiry_url}}', 'ADMIN', true),
('PAYMENT_RECEIVED', 'Payment Received', 'Sent to customer when payment is received', E'💳 Payment Confirmation\n\n{{default_greeting}} {{customer_name}}!\n\nWe have received your payment.\n\nOrder: {{order_number}}\nAmount: {{currency}}{{order_total}}\nMethod: {{payment_method}}\nStatus: {{payment_status}}\n\n{{default_footer}}', 'CUSTOMER', true),
('PAYMENT_PENDING', 'Payment Pending', 'Sent to customer when payment is pending', E'💳 Payment Pending\n\n{{default_greeting}} {{customer_name}}!\n\nYour payment for order {{order_number}} is pending.\n\nAmount: {{currency}}{{order_total}}\n\nPlease complete the payment to process your order.\n\n{{default_footer}}', 'CUSTOMER', true),
('PAYMENT_FAILED', 'Payment Failed', 'Sent to customer when payment fails', E'💳 Payment Failed\n\n{{default_greeting}} {{customer_name}}!\n\nYour payment for order {{order_number}} has failed.\n\nAmount: {{currency}}{{order_total}}\n\nPlease try again or contact us for assistance.\n\n{{default_footer}}', 'CUSTOMER', true),
('GENERAL_ENQUIRY', 'General Enquiry', 'Sent for general enquiries', E'{{default_greeting}} {{business_name}}!\n\n{{inquiry_message}}\n\nThank you!', 'BUSINESS', true),
('CUSTOMER_WELCOME', 'Customer Welcome', 'Sent to welcome new customers', E'{{default_greeting}} {{customer_name}}!\n\nWelcome to {{business_name}} 💎\n\nWe are delighted to have you as our customer.\n\nExplore our collection: {{website_url}}\n\n{{default_footer}}', 'CUSTOMER', true),
('CUSTOMER_FOLLOW_UP', 'Customer Follow Up', 'Sent to follow up with customers', E'{{default_greeting}} {{customer_name}}!\n\nWe hope you are enjoying your purchase from {{business_name}} 💎\n\nIf you have any questions or need assistance, please don''t hesitate to contact us.\n\n{{default_footer}}', 'CUSTOMER', true)
ON CONFLICT (template_key) DO NOTHING;

-- 7. Verify setup
SELECT 
  '✅ WhatsApp templates system setup complete!' AS status,
  (SELECT COUNT(*) FROM whatsapp_templates) AS templates_count,
  (SELECT COUNT(*) FROM whatsapp_message_logs) AS logs_count;
