import { whatsappEnv } from './whatsapp.env';
import type { WhatsAppNotifiableStatus, WhatsAppOrderContext, WhatsAppTemplateConfig } from './whatsapp.types';

/**
 * Mirrors aa_catalog/server/src/integrations/whatsapp/whatsapp.config.ts exactly. One entry per
 * notifiable CustomerStatus — templateName is unset until Meta approves the corresponding
 * template (submitted 2026-07-26, category Utility).
 */
export const WHATSAPP_TEMPLATES: Record<WhatsAppNotifiableStatus, WhatsAppTemplateConfig> = {
  'Payment Confirmed': {
    templateName: whatsappEnv.templates.paymentConfirmed,
    languageCode: whatsappEnv.templateLanguageCode,
    placeholders: [(o: WhatsAppOrderContext) => o.customerName, (o: WhatsAppOrderContext) => o.orderReference],
  },
  Shipped: {
    templateName: whatsappEnv.templates.shipped,
    languageCode: whatsappEnv.templateLanguageCode,
    placeholders: [(o: WhatsAppOrderContext) => o.customerName, (o: WhatsAppOrderContext) => o.orderReference],
  },
  Completed: {
    templateName: whatsappEnv.templates.completed,
    languageCode: whatsappEnv.templateLanguageCode,
    placeholders: [(o: WhatsAppOrderContext) => o.customerName, (o: WhatsAppOrderContext) => o.orderReference],
  },
  Cancelled: {
    templateName: whatsappEnv.templates.cancelled,
    languageCode: whatsappEnv.templateLanguageCode,
    placeholders: [(o: WhatsAppOrderContext) => o.customerName, (o: WhatsAppOrderContext) => o.orderReference],
  },
};

export function isWhatsAppTemplateConfigured(status: WhatsAppNotifiableStatus): boolean {
  return Boolean(WHATSAPP_TEMPLATES[status].templateName);
}
