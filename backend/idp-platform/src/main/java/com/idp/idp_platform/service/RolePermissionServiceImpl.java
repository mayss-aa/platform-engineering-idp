package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.PermissionDto;
import com.idp.idp_platform.entity.Permission;
import com.idp.idp_platform.entity.Role;
import com.idp.idp_platform.repository.PermissionRepository;
import com.idp.idp_platform.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RolePermissionServiceImpl
        implements RolePermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void assignPermissionToRole(
            Long roleId,
            Long permissionId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        Permission permission =
                permissionRepository.findById(permissionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Permission not found"));

        if (!role.getPermissions().contains(permission)) {
            role.getPermissions().add(permission);
        }

        roleRepository.save(role);
    }

    @Override
    public void removePermissionFromRole(
            Long roleId,
            Long permissionId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        role.getPermissions()
                .removeIf(permission ->
                        permission.getId().equals(permissionId));

        roleRepository.save(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionDto> getPermissionsByRole(
            Long roleId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        return role.getPermissions()
                .stream()
                .map(permission ->
                        PermissionDto.builder()
                                .id(permission.getId())
                                .resource(permission.getResource())
                                .action(permission.getAction())
                                .build())
                .toList();
    }
}