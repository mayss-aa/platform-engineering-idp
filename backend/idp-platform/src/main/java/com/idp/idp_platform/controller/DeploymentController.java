package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.DeploymentDto;
import com.idp.idp_platform.service.DeploymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deployments")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_DEPLOYMENT')")
    public DeploymentDto createDeployment(
            @Valid @RequestBody DeploymentDto dto) {

        return deploymentService.createDeployment(dto);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_DEPLOYMENTS')")
    public List<DeploymentDto> getAllDeployments() {

        return deploymentService.getAllDeployments();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_DEPLOYMENTS')")
    public DeploymentDto getDeploymentById(
            @PathVariable Long id) {

        return deploymentService.getDeploymentById(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('MANAGE_DEPLOYMENTS')")
    public DeploymentDto updateDeploymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return deploymentService.updateDeploymentStatus(
                id,
                body.get("status")
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_DEPLOYMENTS')")
    public void deleteDeployment(
            @PathVariable Long id) {

        deploymentService.deleteDeployment(id);
    }
}