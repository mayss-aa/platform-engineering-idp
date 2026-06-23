package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.ServiceCatalogDto;
import com.idp.idp_platform.entity.ServiceCatalog;
import org.springframework.stereotype.Component;

@Component
public class ServiceCatalogMapper {

    public ServiceCatalogDto toDto(ServiceCatalog service) {

        return ServiceCatalogDto.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .templatePath(service.getTemplatePath())
                .version(service.getVersion())
                .build();
    }

    public ServiceCatalog toEntity(ServiceCatalogDto dto) {

        return ServiceCatalog.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .templatePath(dto.getTemplatePath())
                .version(dto.getVersion())
                .build();
    }
}