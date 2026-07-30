package com.ecommerce.service.impl;

import com.ecommerce.dto.DashboardStatsDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        List<Product> products = productRepository.findAll();

        // 1. Calculate total sales (sum of totalAmount for non-cancelled orders)
        BigDecimal totalSales = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Count total orders
        long totalOrders = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .count();

        // 3. Count total clicks
        long totalClicks = products.stream()
                .mapToLong(Product::getClickCount)
                .sum();

        // 4. Map to track purchases per product
        Map<Long, Long> productPurchasesMap = new HashMap<>();
        long totalPurchasesCount = 0;

        for (Order order : orders) {
            if (order.getStatus() != OrderStatus.CANCELLED) {
                for (OrderItem item : order.getItems()) {
                    Long productId = item.getProduct().getId();
                    long qty = item.getQuantity();
                    productPurchasesMap.put(productId, productPurchasesMap.getOrDefault(productId, 0L) + qty);
                    totalPurchasesCount += qty;
                }
            }
        }

        // 5. Construct Product Performance list
        long finalTotalPurchasesCount = totalPurchasesCount;
        List<DashboardStatsDTO.ProductPerformanceDTO> performanceList = products.stream().map(p -> {
            long clicks = p.getClickCount();
            long purchases = productPurchasesMap.getOrDefault(p.getId(), 0L);
            double purchaseRate = clicks > 0 ? (double) purchases / clicks : 0.0;

            DashboardStatsDTO.ProductPerformanceDTO perf = new DashboardStatsDTO.ProductPerformanceDTO();
            perf.setId(p.getId());
            perf.setName(p.getName());
            perf.setClicks(clicks);
            perf.setPurchases(purchases);
            perf.setPurchaseRate(purchaseRate);
            return perf;
        }).sorted((p1, p2) -> Long.compare(p2.getClicks(), p1.getClicks())) // sort by popularity (clicks)
          .collect(Collectors.toList());

        // 6. Overall conversion rate
        double overallConversionRate = totalClicks > 0 ? (double) finalTotalPurchasesCount / totalClicks : 0.0;

        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalSales(totalSales);
        stats.setTotalClicks(totalClicks);
        stats.setTotalOrders(totalOrders);
        stats.setConversionRate(overallConversionRate);
        stats.setTopProducts(performanceList);

        return stats;
    }
}
