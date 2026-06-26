package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.entity.Deployment;
import com.idp.idp_platform.entity.ProvisionRequest;
import com.idp.idp_platform.entity.enums.DeploymentStatus;
import com.idp.idp_platform.mapper.DeploymentMapper;
import com.idp.idp_platform.repository.DeploymentRepository;
import com.idp.idp_platform.repository.ProvisionRequestRepository;
import com.idp.idp_platform.terraform.model.TerraformResult;
import com.idp.idp_platform.terraform.service.TerraformService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeploymentServiceImpl implements DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ProvisionRequestRepository requestRepository;
    private final DeploymentMapper mapper;
    private final TerraformService terraformService;

    @Override
    public DeploymentDto createDeployment(DeploymentDto dto) {

        ProvisionRequest request = requestRepository.findById(dto.getProvisionRequestId())
                .orElseThrow(() ->
                        new RuntimeException("Provision Request not found"));

        if (deploymentRepository.existsByProvisionRequest(request)) {
            throw new RuntimeException(
                    "Deployment already exists for this request");
        }

        Deployment deployment = Deployment.builder()
                .name(dto.getName())
                .environment(dto.getEnvironment())
                .status(DeploymentStatus.PENDING)
                .deploymentLog(dto.getDeploymentLog())
                .terraformPlan(dto.getTerraformPlan())
                .terraformState(dto.getTerraformState())
                .provisionRequest(request)
                .build();

        return mapper.toDto(
                deploymentRepository.save(deployment)
        );
    }

    @Override
    public List<DeploymentDto> getAllDeployments() {

        return deploymentRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public DeploymentDto getDeploymentById(Long id) {

        Deployment deployment = findDeployment(id);

        return mapper.toDto(deployment);
    }

    @Override
    public DeploymentDto updateDeploymentStatus(
            Long id,
            String status) {

        Deployment deployment = findDeployment(id);

        deployment.setStatus(
                DeploymentStatus.valueOf(status)
        );

        if (deployment.getStatus() == DeploymentStatus.SUCCESS
                || deployment.getStatus() == DeploymentStatus.FAILED
                || deployment.getStatus() == DeploymentStatus.CANCELLED) {

            deployment.setCompletedAt(LocalDateTime.now());
        }

        return mapper.toDto(
                deploymentRepository.save(deployment)
        );
    }

    @Override
    public void deleteDeployment(Long id) {

        if (!deploymentRepository.existsById(id)) {
            throw new RuntimeException("Deployment not found");
        }

        deploymentRepository.deleteById(id);
    }

    @Override
    public TerraformResult executeTerraformPlan(Long deploymentId) {

        Deployment deployment = findDeployment(deploymentId);

        markDeploymentAsRunning(deployment);

        TerraformResult result = terraformService.planInfrastructure();

        completeDeployment(deployment, result);

        return result;
    }

    private Deployment findDeployment(Long deploymentId) {

        return deploymentRepository.findById(deploymentId)
                .orElseThrow(() ->
                        new RuntimeException("Deployment not found"));
    }

    private void markDeploymentAsRunning(Deployment deployment) {

        deployment.setStatus(DeploymentStatus.DEPLOYING);        deploymentRepository.save(deployment);
    }

    private void completeDeployment(
            Deployment deployment,
            TerraformResult result) {

        deployment.setDeploymentLog(result.getStandardOutput());
        deployment.setTerraformPlan(result.getStandardOutput());

        deployment.setStatus(
                result.isSuccess()
                        ? DeploymentStatus.SUCCESS
                        : DeploymentStatus.FAILED
        );

        deployment.setCompletedAt(LocalDateTime.now());

        deploymentRepository.save(deployment);
    }
}