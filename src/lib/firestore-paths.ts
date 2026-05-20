export const paths = {
  user: (userId: string) => `users/${userId}`,
  umkm: (umkmId: string) => `umkms/${umkmId}`,
  products: (umkmId: string) => `umkms/${umkmId}/products`,
  faqs: (umkmId: string) => `umkms/${umkmId}/faqs`,
  orders: (umkmId: string) => `umkms/${umkmId}/orders`,
  conversations: (umkmId: string) => `umkms/${umkmId}/conversations`,
  analytics: (umkmId: string) => `umkms/${umkmId}/analytics`
};
