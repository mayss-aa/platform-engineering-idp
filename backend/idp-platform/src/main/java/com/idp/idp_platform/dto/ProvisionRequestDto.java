package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisionRequestDto {

    private Long id;

    private String status;

    private String parameters;

    private Long userId;

    private Long serviceCatalogId;
}