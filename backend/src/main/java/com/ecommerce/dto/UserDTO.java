package com.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private List<String> roles;
}
