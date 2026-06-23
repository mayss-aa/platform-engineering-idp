package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.PermissionDto;
import com.idp.idp_platform.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @PostMapping("/{roleId}/permissions/{permissionId}")
    public String assignPermissionToRole(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {

        rolePermissionService.assignPermissionToRole(
                roleId,
                permissionId
        );

        return "Permission assigned successfully";
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public String removePermissionFromRole(
            @PathVariable Long roleId,
            @PathVariable Long permissionId) {

        rolePermissionService.removePermissionFromRole(
                roleId,
                permissionId
        );

        return "Permission removed successfully";
    }

    @GetMapping("/{roleId}/permissions")
    public List<PermissionDto> getRolePermissions(
            @PathVariable Long roleId) {

        return rolePermissionService
                .getPermissionsByRole(roleId);
    }
}