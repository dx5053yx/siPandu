export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  isAvailable?: boolean;
};

export type OrderItem = {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
};

export type BotResult = {
  reply: string;
  order?: {
    customerName: string;
    items: OrderItem[];
    total: number;
  };
};
