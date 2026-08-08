/**
 * Mirrors aa_catalog/server/src/integrations/whatsapp/whatsapp.types.ts exactly (WhatsApp-
 * notification project, 2026-07-26). The 4 CustomerStatus values that ever trigger a WhatsApp
 * send from this side (Order Received uses a push notification instead, sent from aa_catalog's
 * server at checkout time — aagroup-web never triggers push; Expired never notifies at all).
 */
export type WhatsAppNotifiableStatus = 'Payment Confirmed' | 'Shipped' | 'Completed' | 'Cancelled';

export interface WhatsAppTemplateConfig {
  templateName: string | undefined;
  languageCode: string;
  placeholders: Array<(order: WhatsAppOrderContext) => string>;
}

export interface WhatsAppOrderContext {
  customerName: string;
  customerPhone: string;
  orderReference: string;
}

export interface WhatsAppSendResult {
  ok: boolean;
  messageId?: string;
  skippedReason?: 'not_configured' | 'account_not_configured';
}

export class WhatsAppRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'WhatsAppRequestError';
  }
}
