package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.entity.Deployment;
import com.idp.idp_platform.entity.ProvisionRequest;
import com.idp.idp_platform.entity.enums.DeploymentStatus;
import com.idp.idp_platform.mapper.DeploymentMapper;
import com.idp.idp_platform.repository.DeploymentRepository;
import com.idp.idp_platform.repository.ProvisionRequestRepository;
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

    @Override
    public DeploymentDto createDeployment(DeploymentDto dto) {

        ProvisionRequest request =
                requestRepository.findById(dto.getRequestId())
                        .orElseThrow(() ->
                                new RuntimeException("Request not found"));

        Deployment deployment = Deployment.builder()
                .status(
                        DeploymentStatus.valueOf(
                                dto.getStatus()
                        )
                )
                .terraformPlan(dto.getTerraformPlan())
                .terraformState(dto.getTerraformState())
                .createdAt(LocalDateTime.now())
                .request(request)
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

        return deploymentRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException("Deployment not found"));
    }

    @Override
    public void deleteDeployment(Long id) {

        if (!deploymentRepository.existsById(id)) {
            throw new RuntimeException("Deployment not found");
        }

        deploymentRepository.deleteById(id);
    }

}