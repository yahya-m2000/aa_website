import { isWhatsAppTemplateConfigured, WHATSAPP_TEMPLATES } from './whatsapp.config';
import { sendWhatsAppTemplate } from './whatsapp.client';
import type { WhatsAppNotifiableStatus, WhatsAppOrderContext, WhatsAppSendResult } from './whatsapp.types';

/** Meta's Cloud API wants the destination number without a leading '+' or any separators. */
function normalizePhoneForWhatsApp(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

/**
 * Mirrors aa_catalog/server/src/integrations/whatsapp/whatsapp.service.ts exactly. Never
 * throws — every failure is caught and logged (console only, reference/status, never phone
 * number or message body). Callers invoke this with `void` from the admin CMS's status-change
 * routes, after the SharePoint write has already succeeded — nothing here may affect that
 * outcome.
 */
export async function sendOrderStatusWhatsApp(
  status: WhatsAppNotifiableStatus,
  order: WhatsAppOrderContext,
): Promise<WhatsAppSendResult> {
  if (!isWhatsAppTemplateConfigured(status)) {
    console.log(`[whatsapp] template not configured for status "${status}" — skipping send for order ${order.orderReference}`);
    return { ok: false, skippedReason: 'not_configured' };
  }

  const config = WHATSAPP_TEMPLATES[status];
  try {
    const to = normalizePhoneForWhatsApp(order.customerPhone);
    const bodyParameters = config.placeholders.map((getValue) => getValue(order));
    const messageId = await sendWhatsAppTemplate(to, config.templateName!, config.languageCode, bodyParameters);
    console.log(`[whatsapp] sent "${status}" template for order ${order.orderReference} (message ${messageId})`);
    return { ok: true, messageId };
  } catch (error) {
    console.error(
      `[whatsapp] send failed for order ${order.orderReference} (status ${status}): ${error instanceof Error ? error.message : String(error)}`,
    );
    return { ok: false };
  }
}
