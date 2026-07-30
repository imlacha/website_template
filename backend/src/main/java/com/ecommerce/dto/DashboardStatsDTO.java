package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private BigDecimal totalSales;
    private Long totalClicks;
    private Long totalOrders;
    private Double conversionRate; // Overall purchase quantity / total clicks
    private List<ProductPerformanceDTO> topProducts;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPerformanceDTO {
        private Long id;
        private String name;
        private Long clicks;
        private Long purchases;
        private Double purchaseRate; // purchases / clicks
    }
}
