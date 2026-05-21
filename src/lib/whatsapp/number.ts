export const DEFAULT_WHATSAPP_NUMBER = '628997595299';

export function normalizeIndonesianWhatsAppNumber(input?: string | null): string {
  const raw = (input || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, '');

  if (!raw) return DEFAULT_WHATSAPP_NUMBER;
  if (raw.startsWith('62')) return raw;
  if (raw.startsWith('0')) return `62${raw.slice(1)}`;
  if (raw.startsWith('8')) return `62${raw}`;

  return raw;
}

export function formatWhatsAppNumber(input?: string | null): string {
  const normalized = normalizeIndonesianWhatsAppNumber(input);

  if (!normalized.startsWith('62')) return normalized;

  const national = `0${normalized.slice(2)}`;
  return national.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
}
