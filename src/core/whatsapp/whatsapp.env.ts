// Same WhatsApp Cloud API credentials as aa_catalog/server/src/config/env.ts's env.whatsapp —
// aagroup-web calls Meta directly (it already has its own independent Graph credentials rather
// than routing through the server, see core/graph/env.ts's ADMIN_GRAPH_* prefix; WhatsApp
// follows the same architectural precedent). Per-status template names are left unset until
// Meta approves them (submitted 2026-07-26) — see whatsapp.config.ts's isWhatsAppTemplateConfigured().
export const whatsappEnv = {
  accessToken: process.env.ADMIN_WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.ADMIN_WHATSAPP_PHONE_NUMBER_ID,
  wabaId: process.env.ADMIN_WHATSAPP_WABA_ID,
  templates: {
    paymentConfirmed: process.env.ADMIN_WHATSAPP_TEMPLATE_PAYMENT_CONFIRMED,
    shipped: process.env.ADMIN_WHATSAPP_TEMPLATE_SHIPPED,
    completed: process.env.ADMIN_WHATSAPP_TEMPLATE_COMPLETED,
    cancelled: process.env.ADMIN_WHATSAPP_TEMPLATE_CANCELLED,
  },
  templateLanguageCode: process.env.ADMIN_WHATSAPP_TEMPLATE_LANGUAGE_CODE ?? 'en',
};
