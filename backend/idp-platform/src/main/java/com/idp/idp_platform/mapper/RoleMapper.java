package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.RoleDto;
import com.idp.idp_platform.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleDto toDto(Role role) {

        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .build();
    }

    public Role toEntity(RoleDto dto) {

        return Role.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }
}