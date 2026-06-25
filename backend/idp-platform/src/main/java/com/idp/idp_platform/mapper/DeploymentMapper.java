package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.entity.Deployment;
import org.springframework.stereotype.Component;

@Component
public class DeploymentMapper {

    public DeploymentDto toDto(Deployment deployment) {

        return DeploymentDto.builder()
                .id(deployment.getId())
                .name(deployment.getName())
                .environment(deployment.getEnvironment())
                .status(deployment.getStatus().name())
                .startedAt(deployment.getStartedAt())
                .completedAt(deployment.getCompletedAt())
                .deploymentLog(deployment.getDeploymentLog())
                .terraformPlan(deployment.getTerraformPlan())
                .terraformState(deployment.getTerraformState())
                .provisionRequestId(
                        deployment.getProvisionRequest() != null
                                ? deployment.getProvisionRequest().getId()
                                : null
                )
                .build();
    }

    public Deployment toEntity(DeploymentDto dto) {

        return Deployment.builder()
                .id(dto.getId())
                .name(dto.getName())
                .environment(dto.getEnvironment())
                .terraformPlan(dto.getTerraformPlan())
                .terraformState(dto.getTerraformState())
                .deploymentLog(dto.getDeploymentLog())
                .build();
    }
}