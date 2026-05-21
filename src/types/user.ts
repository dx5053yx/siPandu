import { Timestamp } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'merchant_owner' | 'staff';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  merchantId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
