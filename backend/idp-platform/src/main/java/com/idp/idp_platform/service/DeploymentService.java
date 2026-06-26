package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.terraform.model.TerraformResult;

import java.util.List;

public interface DeploymentService {

    DeploymentDto createDeployment(DeploymentDto dto);

    List<DeploymentDto> getAllDeployments();

    DeploymentDto getDeploymentById(Long id);

    DeploymentDto updateDeploymentStatus(
            Long id,
            String status
    );

    void deleteDeployment(Long id);

    /**
     * Executes the Terraform planning workflow
     * for a deployment.
     *
     * @param deploymentId deployment identifier
     * @return Terraform execution result
     */
    TerraformResult executeTerraformPlan(Long deploymentId);
}