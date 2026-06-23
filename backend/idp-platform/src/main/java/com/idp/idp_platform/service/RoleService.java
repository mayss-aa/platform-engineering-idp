package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.RoleDto;

import java.util.List;

public interface RoleService {

    RoleDto createRole(RoleDto dto);

    List<RoleDto> getAllRoles();
    void deleteRole(Long id);
    RoleDto getRoleById(Long id);
}