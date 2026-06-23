package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.RoleDto;
import com.idp.idp_platform.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public RoleDto createRole(
            @RequestBody RoleDto dto) {

        return roleService.createRole(dto);
    }

    @GetMapping
    public List<RoleDto> getAllRoles() {

        return roleService.getAllRoles();
    }

    @DeleteMapping("/{id}")
    public void deleteRole(
            @PathVariable Long id) {

        roleService.deleteRole(id);
    }

    @GetMapping("/{id}")
    public RoleDto getRoleById(
            @PathVariable Long id) {

        return roleService.getRoleById(id);
    }
}