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
public class DeploymentDto {

    private Long id;

    @NotBlank(message = "Deployment name is required")
    private String name;

    @NotBlank(message = "Environment is required")
    private String environment;

    private String status;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private String deploymentLog;

    /*
     * Sprint 6
     */
    private String terraformPlan;

    private String terraformState;

    @NotNull(message = "Provision Request ID is required")
    private Long provisionRequestId;
}