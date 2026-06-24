package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.ProvisionRequestDto;
import com.idp.idp_platform.entity.ProvisionRequest;
import org.springframework.stereotype.Component;

@Component
public class ProvisionRequestMapper {

    public ProvisionRequestDto toDto(ProvisionRequest request) {

        return ProvisionRequestDto.builder()
                .id(request.getId())
                .serviceCatalogId(
                        request.getServiceCatalog() != null
                                ? request.getServiceCatalog().getId()
                                : null
                )
                .userId(
                        request.getRequestedBy() != null
                                ? request.getRequestedBy().getId()
                                : null
                )
                .environment(request.getEnvironment())
                .justification(request.getJustification())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}