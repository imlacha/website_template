import { ProductPerformance } from './product.models';

export interface DashboardStats {
  totalSales: number;
  totalClicks: number;
  totalOrders: number;
  conversionRate: number;
  topProducts: ProductPerformance[];
}
