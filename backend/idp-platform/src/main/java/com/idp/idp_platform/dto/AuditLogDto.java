package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {

    private Long id;

    private String action;

    private String resourceType;

    private String details;

    private Long userId;

}