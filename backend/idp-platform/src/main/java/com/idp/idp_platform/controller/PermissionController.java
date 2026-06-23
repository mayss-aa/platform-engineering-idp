package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.PermissionDto;
import com.idp.idp_platform.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public PermissionDto createPermission(
            @RequestBody PermissionDto dto) {

        return permissionService.createPermission(dto);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public List<PermissionDto> getAllPermissions() {

        return permissionService.getAllPermissions();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public PermissionDto getPermissionById(
            @PathVariable Long id) {

        return permissionService.getPermissionById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public PermissionDto updatePermission(
            @PathVariable Long id,
            @RequestBody PermissionDto dto) {

        return permissionService.updatePermission(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_USERS')")
    public void deletePermission(
            @PathVariable Long id) {

        permissionService.deletePermission(id);
    }
}