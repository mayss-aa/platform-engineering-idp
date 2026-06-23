package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentDto {

    private Long id;

    private String status;

    private String terraformPlan;

    private String terraformState;

    private Long requestId;

}