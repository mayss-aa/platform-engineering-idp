package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.entity.Deployment;
import org.springframework.stereotype.Component;

@Component
public class DeploymentMapper {

    public DeploymentDto toDto(Deployment deployment) {

        return DeploymentDto.builder()
                .id(deployment.getId())
                .status(deployment.getStatus().name())
                .terraformPlan(deployment.getTerraformPlan())
                .terraformState(deployment.getTerraformState())
                .requestId(
                        deployment.getRequest() != null
                                ? deployment.getRequest().getId()
                                : null
                )
                .build();
    }

}