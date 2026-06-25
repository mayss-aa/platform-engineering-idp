package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.DeploymentDto;

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
}