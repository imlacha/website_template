// 商品沒有圖片時的替代圖。用 data URI 內嵌，
// 原本指向的 assets/placeholder.jpg 實際不存在，會讓每張缺圖的卡片都送出 404。
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
       <rect width="120" height="120" fill="#F6F8EF"/>
       <ellipse cx="60" cy="96" rx="52" ry="16" fill="#DCEFC4"/>
       <circle cx="60" cy="58" r="26" fill="#FFFFFF" stroke="#3B3A32" stroke-width="3"/>
       <circle cx="51" cy="55" r="3.4" fill="#3B3A32"/>
       <circle cx="69" cy="55" r="3.4" fill="#3B3A32"/>
       <path d="M53 68 q7 6 14 0" stroke="#3B3A32" stroke-width="3"
             fill="none" stroke-linecap="round"/>
     </svg>`);

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId?: number;
  categoryName?: string;
  imageUrl: string;
  clickCount?: number;
}

export interface ProductPerformance {
  id: number;
  name: string;
  clicks: number;
  purchases: number;
  purchaseRate: number;
}
