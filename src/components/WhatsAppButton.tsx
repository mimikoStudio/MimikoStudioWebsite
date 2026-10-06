import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { 
  WhatsAppTemplateKey, 
  WhatsAppTemplateVariables,
  WhatsAppRecipientType 
} from '../types/whatsapp';
import { 
  getWhatsAppTemplate, 
  renderWhatsAppTemplate, 
  generateWhatsAppURL,
  getWhatsAppSettings,
  logWhatsAppMessage
} from '../lib/whatsappService';

interface WhatsAppButtonProps {
  templateKey: WhatsAppTemplateKey;
  variables: WhatsAppTemplateVariables;
  recipientPhone?: string;
  recipientType?: WhatsAppRecipientType;
  entityType?: 'order' | 'inquiry' | 'booking' | 'customer' | 'product' | 'invoice' | 'custom_order';
  entityId?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function DynamicWhatsAppButton({
  templateKey,
  variables,
  recipientPhone,
  recipientType = 'CUSTOMER',
  entityType,
  entityId,
  label = '💬 WhatsApp',
  variant = 'primary',
  size = 'md',
  showPreview = false,
  className = '',
  onClick,
}: WhatsAppButtonProps) {
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (onClick) {
      onClick();
    }

    setLoading(true);

    try {
      // Get template
      const template = await getWhatsAppTemplate(templateKey);
      if (!template) {
        console.error('Template not found:', templateKey);
        setLoading(false);
        return;
      }

      // Get settings
      const settings = await getWhatsAppSettings();

      // Render message
      const message = renderWhatsAppTemplate(template.message_body, variables, settings);

      // Determine recipient phone
      let phone = recipientPhone;
      if (!phone) {
        if (recipientType === 'ADMIN' || recipientType === 'BUSINESS') {
          phone = settings.business_whatsapp_number;
        } else {
          phone = variables.customer_phone || '';
        }
      }

      if (!phone) {
        alert('Phone number is not available');
        setLoading(false);
        return;
      }

      // Show preview if enabled
      if (showPreview) {
        setPreviewMessage(message);
        setShowPreviewModal(true);
        setLoading(false);
        return;
      }

      // Generate WhatsApp URL
      const url = generateWhatsAppURL(phone, message, settings.country_code);

      // Log message
      if (entityType && entityId) {
        await logWhatsAppMessage(
          template.id,
          recipientType,
          phone,
          entityType,
          entityId,
          message,
          'generated'
        );
      }

      // Open WhatsApp
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
      alert('Error generating WhatsApp message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSend = async () => {
    try {
      const template = await getWhatsAppTemplate(templateKey);
      if (!template) return;

      const settings = await getWhatsAppSettings();
      const message = renderWhatsAppTemplate(template.message_body, variables, settings);

      let phone = recipientPhone;
      if (!phone) {
        if (recipientType === 'ADMIN' || recipientType === 'BUSINESS') {
          phone = settings.business_whatsapp_number;
        } else {
          phone = variables.customer_phone || '';
        }
      }

      if (!phone) return;

      const url = generateWhatsAppURL(phone, message, settings.country_code);

      if (entityType && entityId) {
        await logWhatsAppMessage(
          template.id,
          recipientType,
          phone,
          entityType,
          entityId,
          message,
          'opened'
        );
      }

      window.open(url, '_blank');
      setShowPreviewModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-[#25D366] text-white hover:bg-[#20BA5C]',
    secondary: 'bg-ivory text-chocolate border border-beige hover:bg-cream',
    outline: 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white',
    icon: 'bg-[#25D366] text-white hover:bg-[#20BA5C] p-2',
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-sm font-medium
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        aria-label={label}
      >
        {variant === 'icon' ? (
          <MessageCircle size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        ) : (
          <>
            <MessageCircle size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
            <span>{label}</span>
          </>
        )}
        {loading && <span className="animate-spin">⏳</span>}
      </button>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20">
              <h3 className="text-xl font-heading text-chocolate">
                WhatsApp Message Preview
              </h3>
              <p className="text-sm text-coffee/60 mt-1">
                This is the message that will be opened in WhatsApp
              </p>
            </div>
            <div className="p-6">
              <div className="bg-[#E5DDD5] rounded-sm p-4 mb-4">
                <pre className="text-sm text-chocolate whitespace-pre-wrap font-body">
                  {previewMessage}
                </pre>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmSend}
                  className="btn-primary flex-1"
                >
                  💬 Open WhatsApp
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
