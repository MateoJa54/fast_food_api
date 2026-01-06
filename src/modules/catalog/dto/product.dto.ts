export type ProductDto = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
  tags?: string[];
};
