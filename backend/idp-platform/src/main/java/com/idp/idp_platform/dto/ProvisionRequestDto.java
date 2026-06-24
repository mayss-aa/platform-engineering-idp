package com.idp.idp_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisionRequestDto {

    private Long id;

    @NotNull(message = "Service Catalog ID is required")
    private Long serviceCatalogId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Environment is required")
    private String environment;

    @NotBlank(message = "Justification is required")
    private String justification;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}