package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCatalogDto {

    private Long id;

    private String name;

    private String description;

    private String templatePath;

    private String version;
}