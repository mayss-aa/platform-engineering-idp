package com.idp.idp_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCatalogDto {

    private Long id;

    @NotBlank(message = "Service name is required")
    @Size(
            min = 3,
            max = 100,
            message = "Service name must be between 3 and 100 characters"
    )
    private String name;

    @NotBlank(message = "Description is required")
    @Size(
            max = 1000,
            message = "Description must not exceed 1000 characters"
    )
    private String description;

    @NotBlank(message = "Template path is required")
    @Size(
            max = 255,
            message = "Template path must not exceed 255 characters"
    )
    private String templatePath;

    @NotBlank(message = "Version is required")
    @Size(
            max = 50,
            message = "Version must not exceed 50 characters"
    )
    private String version;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}