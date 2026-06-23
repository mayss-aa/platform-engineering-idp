package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.OrganizationDto;
import com.idp.idp_platform.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public OrganizationDto createOrganization(
            @RequestBody OrganizationDto dto) {

        return organizationService.createOrganization(dto);
    }

    @GetMapping
    public List<OrganizationDto> getAllOrganizations() {

        return organizationService.getAllOrganizations();
    }

    @GetMapping("/{id}")
    public OrganizationDto getOrganizationById(
            @PathVariable Long id) {

        return organizationService.getOrganizationById(id);
    }
}