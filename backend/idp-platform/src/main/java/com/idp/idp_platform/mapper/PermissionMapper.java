package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.PermissionDto;
import com.idp.idp_platform.entity.Permission;
import org.springframework.stereotype.Component;

@Component
public class PermissionMapper {

    public PermissionDto toDto(Permission permission) {

        return PermissionDto.builder()
                .id(permission.getId())
                .resource(permission.getResource())
                .action(permission.getAction())
                .build();
    }

    public Permission toEntity(PermissionDto dto) {

        return Permission.builder()
                .id(dto.getId())
                .resource(dto.getResource())
                .action(dto.getAction())
                .build();
    }
}