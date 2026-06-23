package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.auth.LoginRequest;
import com.idp.idp_platform.dto.auth.LoginResponse;
import com.idp.idp_platform.dto.auth.RegisterRequest;
import com.idp.idp_platform.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterRequest request) {

        authenticationService.register(request);

        return "User registered successfully";
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        return authenticationService.login(request);
    }

    @GetMapping("/me")
    public Object me(Authentication authentication) {

        return authentication.getAuthorities();
    }
}
