package com.ecommerce.service;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.ProductDTO;

import java.util.List;

public interface ProductService {
    List<ProductDTO> getAllProducts();
    List<ProductDTO> searchProducts(String keyword);
    List<ProductDTO> getProductsByCategory(Long categoryId);
    ProductDTO getProductById(Long id, boolean incrementClick);
    ProductDTO createProduct(ProductDTO productDTO);
    ProductDTO updateProduct(Long id, ProductDTO productDTO);
    void deleteProduct(Long id);
    List<CategoryDTO> getAllCategories();
}
