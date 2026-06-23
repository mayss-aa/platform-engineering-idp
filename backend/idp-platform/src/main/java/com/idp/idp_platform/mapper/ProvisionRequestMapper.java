package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.ProvisionRequestDto;
import com.idp.idp_platform.entity.ProvisionRequest;
import org.springframework.stereotype.Component;

@Component
public class ProvisionRequestMapper {

    public ProvisionRequestDto toDto(ProvisionRequest request) {

        return ProvisionRequestDto.builder()
                .id(request.getId())
                .status(request.getStatus().name())
                .parameters(request.getParameters())
                .userId(
                        request.getUser() != null
                                ? request.getUser().getId()
                                : null
                )
                .serviceCatalogId(
                        request.getServiceCatalog() != null
                                ? request.getServiceCatalog().getId()
                                : null
                )
                .build();
    }
}