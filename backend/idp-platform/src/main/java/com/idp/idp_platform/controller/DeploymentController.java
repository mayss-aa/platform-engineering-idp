package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.service.DeploymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deployments")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;

    @PostMapping
    public DeploymentDto createDeployment(
            @RequestBody DeploymentDto dto) {

        return deploymentService.createDeployment(dto);
    }

    @GetMapping
    public List<DeploymentDto> getAllDeployments() {

        return deploymentService.getAllDeployments();
    }

    @GetMapping("/{id}")
    public DeploymentDto getDeploymentById(
            @PathVariable Long id) {

        return deploymentService.getDeploymentById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteDeployment(
            @PathVariable Long id) {

        deploymentService.deleteDeployment(id);
    }

}