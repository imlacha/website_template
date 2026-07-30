export interface CartItem {
  id?: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}
