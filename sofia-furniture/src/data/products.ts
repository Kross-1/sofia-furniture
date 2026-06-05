export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  categoryIcon?: string;
  price: number;
  image: string;
  images?: string[];
  videos?: string[];
  material?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  iconType?: string;
  iconFile?: string | null;
  slug?: string;
  sort_order?: number;
}
