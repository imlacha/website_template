export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED'
}

// 訂單狀態的中文標籤與樣式，訂單頁／後台／儀表板共用一份，
// 避免各自維護一組 switch 而出現不一致的文案。
export const ORDER_STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  [OrderStatus.PENDING]:   { label: '待處理', cls: 'status-pending' },
  [OrderStatus.SHIPPED]:   { label: '已出貨', cls: 'status-shipped' },
  [OrderStatus.COMPLETED]: { label: '已完成', cls: 'status-completed' },
  [OrderStatus.CANCELLED]: { label: '已取消', cls: 'status-cancelled' }
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}
