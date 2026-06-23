package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.auth.LoginRequest;
import com.idp.idp_platform.dto.auth.LoginResponse;
import com.idp.idp_platform.dto.auth.RegisterRequest;
import com.idp.idp_platform.entity.Role;

import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.repository.RoleRepository;

import com.idp.idp_platform.repository.UserRepository;
import com.idp.idp_platform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl
        implements AuthenticationService {


    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public void register(RegisterRequest request) {


        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Email already exists"
            );
        }

        if (request.getEmail().endsWith("@gmail.com")
                || request.getEmail().endsWith("@yahoo.com")
                || request.getEmail().endsWith("@outlook.com")) {

            throw new RuntimeException(
                    "Professional email required"
            );
        }

        Role role = roleRepository.findByName("DEVELOPER")
                .orElseThrow(() ->
                        new RuntimeException(
                                "Default role DEVELOPER not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .role(role)
                .team(null)
                .build();

        userRepository.save(user);


    }


    @Override
    public LoginResponse login(
            LoginRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid credentials"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid credentials");
        }

        String token =
                jwtService.generateToken(
                        user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }

}

