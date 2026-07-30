package com.ecommerce.service;

import com.ecommerce.dto.JwtResponse;
import com.ecommerce.dto.LoginRequest;
import com.ecommerce.dto.SignUpRequest;
import com.ecommerce.dto.UserDTO;

public interface UserService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    UserDTO registerUser(SignUpRequest signUpRequest);
}
