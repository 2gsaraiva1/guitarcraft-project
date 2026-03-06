export type UserRole = "user" | "admin";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder" | "backorder";

export interface ProductReview {
  userId: number;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthUser {
  username: string;
  role: UserRole;
}

export interface PrebuiltGuitar {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  fullDescription: string;
  shortDescriptionI18n?: Record<string, string>;
  fullDescriptionI18n?: Record<string, string>;
  price: number;
  specs: string[];
  image: string;
  category: string;
  seriesName: string;
  stockStatus: StockStatus;
  stockQuantity: number;
  estimatedRestockDate: string | null;
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
}
