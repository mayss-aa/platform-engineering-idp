package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.OrganizationDto;
import com.idp.idp_platform.entity.Organization;

public class OrganizationMapper {

    public static OrganizationDto toDto(Organization organization) {
        return OrganizationDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .build();
    }

    public static Organization toEntity(OrganizationDto dto) {
        return Organization.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }
}