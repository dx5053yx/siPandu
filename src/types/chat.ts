import type { Timestamp } from './timestamp';

export type ChatChannel = 'whatsapp' | 'mock' | 'openclaw';
export type ChatIntent = 'tanya_produk' | 'pesan' | 'komplain' | 'lokasi' | 'jam_buka' | 'lainnya';
export type ChatStatus = 'open' | 'handled' | 'needs_human';

export type Chat = {
  id: string;
  merchantId: string;
  customerPhone: string;
  customerName?: string;
  channel: ChatChannel;
  lastMessage: string;
  lastIntent?: ChatIntent;
  status: ChatStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type MessageDirection = 'inbound' | 'outbound';
export type MessageSender = 'customer' | 'bot' | 'human';

export type Message = {
  id: string;
  merchantId: string;
  chatId: string;
  direction: MessageDirection;
  sender: MessageSender;
  text: string;
  rawPayload?: Record<string, unknown>;
  intent?: string;
  aiResponseId?: string;
  createdAt: Timestamp;
};
