package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.PermissionDto;

import java.util.List;

public interface PermissionService {

    PermissionDto createPermission(PermissionDto dto);

    List<PermissionDto> getAllPermissions();

    PermissionDto getPermissionById(Long id);

    PermissionDto updatePermission(Long id, PermissionDto dto);

    void deletePermission(Long id);
}