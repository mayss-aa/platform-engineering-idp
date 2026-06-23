package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.PermissionDto;

import java.util.List;

public interface RolePermissionService {

    void assignPermissionToRole(
            Long roleId,
            Long permissionId
    );

    void removePermissionFromRole(
            Long roleId,
            Long permissionId
    );

    List<PermissionDto> getPermissionsByRole(
            Long roleId
    );
}