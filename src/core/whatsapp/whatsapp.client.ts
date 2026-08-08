import { whatsappEnv } from './whatsapp.env';
import { WhatsAppRequestError } from './whatsapp.types';

const GRAPH_API_VERSION = 'v21.0';

interface TemplateMessagePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: { code: string };
    components: [{ type: 'body'; parameters: Array<{ type: 'text'; text: string }> }];
  };
}

interface MetaSendResponse {
  messages?: Array<{ id: string }>;
  error?: { message?: string; code?: number };
}

/**
 * Mirrors aa_catalog/server/src/integrations/whatsapp/whatsapp.client.ts exactly. Single-attempt,
 * no retries — this is a fire-and-forget call (see whatsapp.service.ts).
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParameters: string[],
): Promise<string> {
  if (!whatsappEnv.accessToken || !whatsappEnv.phoneNumberId) {
    throw new WhatsAppRequestError(
      'WhatsApp is not configured: ADMIN_WHATSAPP_ACCESS_TOKEN and ADMIN_WHATSAPP_PHONE_NUMBER_ID must both be set.',
    );
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${whatsappEnv.phoneNumberId}/messages`;
  const payload: TemplateMessagePayload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [{ type: 'body', parameters: bodyParameters.map((text) => ({ type: 'text', text })) }],
    },
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${whatsappEnv.accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new WhatsAppRequestError(error instanceof Error ? error.message : 'Network error calling WhatsApp Cloud API');
  }

  const json = (await response.json().catch(() => ({}))) as MetaSendResponse;

  if (!response.ok || !json.messages?.[0]?.id) {
    throw new WhatsAppRequestError(
      json.error?.message ?? `WhatsApp send failed with status ${response.status}`,
      response.status,
    );
  }

  return json.messages[0].id;
}
