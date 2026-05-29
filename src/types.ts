export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceUSD: number; // Pricing is primarily in USD and calculated dynamically to LBP
  image: string; // base64 or high-quality unsplash url
  categoryId: string;
  subCategoryId?: string;
  stock: number;
  ratingCount: number;
  ratingAverage: number;
  reviews: Review[];
  merchantId?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  approved?: boolean; // Moderation state
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  image?: string;
  parentId?: string; // Standard Category-nested inside categories constraint
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  MERCHANT = "MERCHANT"
}

export interface User {
  id: string;
  username: string;
  phone?: string;
  role: UserRole;
  password?: string; // Stored securely/simulated
  avatar?: string;
  socialProvider?: string; // Optional (Google, Facebook, etc.)
  orders?: Order[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValueUSD: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  productNameEn: string;
  productNameAr: string;
  productImage: string;
  quantity: number;
  priceUSD: number;
}

export enum OrderStatus {
  NEW = "NEW",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  subtotalUSD: number;
  deliveryCostUSD: number;
  totalUSD: number;
  discountUSD: number;
  couponCode?: string;
  paymentMethod: "COD"; // Cash on delivery only
  status: OrderStatus;
  date: string; // ISO string
  createdAt: string; // ISO string
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string; // ISO format
}

export interface ChatSession {
  userId: string;
  username: string;
  messages: ChatMessage[];
  unreadAdmin?: boolean;
  unreadUser?: boolean;
}

export interface SystemSettings {
  appNameEn: string;
  appNameAr: string;
  logo: string; // base64 or source image
  heroBanners: string[]; // list of unsplash promo images
  freeDeliveryThresholdUSD: number;
  deliveryFeeUSD: number;
  usdToLbpRate: number; // e.g. 90000
  requireReviewApproval?: boolean;
}
