package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.UserDto;
import com.idp.idp_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MANAGE_USERS')")
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserDto createUser(
            @RequestBody UserDto dto) {

        return userService.createUser(dto);
    }

    @GetMapping
    public List<UserDto> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserDto getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(
            @PathVariable Long id,
            @RequestBody UserDto dto) {

        return userService.updateUser(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);
    }
}