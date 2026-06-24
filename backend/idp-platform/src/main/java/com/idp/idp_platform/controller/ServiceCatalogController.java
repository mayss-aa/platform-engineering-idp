package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.ServiceCatalogDto;
import com.idp.idp_platform.service.ServiceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SERVICE_CATALOG')")
    public ServiceCatalogDto createService(
            @Valid @RequestBody ServiceCatalogDto dto) {

        return serviceCatalogService.createService(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CREATE','MANAGE_SERVICE_CATALOG')")
    public List<ServiceCatalogDto> getAllServices() {

        return serviceCatalogService.getAllServices();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CREATE','MANAGE_SERVICE_CATALOG')")
    public ServiceCatalogDto getServiceById(
            @PathVariable Long id) {

        return serviceCatalogService.getServiceById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SERVICE_CATALOG')")
    public ServiceCatalogDto updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCatalogDto dto) {

        return serviceCatalogService.updateService(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SERVICE_CATALOG')")
    public void deleteService(
            @PathVariable Long id) {

        serviceCatalogService.deleteService(id);
    }
}