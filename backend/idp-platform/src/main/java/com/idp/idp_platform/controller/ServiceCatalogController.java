package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.ServiceCatalogDto;
import com.idp.idp_platform.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    @PostMapping
    public ServiceCatalogDto createService(
            @RequestBody ServiceCatalogDto dto) {

        return serviceCatalogService.createService(dto);
    }

    @GetMapping
    public List<ServiceCatalogDto> getAllServices() {

        return serviceCatalogService.getAllServices();
    }

    @GetMapping("/{id}")
    public ServiceCatalogDto getServiceById(
            @PathVariable Long id) {

        return serviceCatalogService.getServiceById(id);
    }

    @PutMapping("/{id}")
    public ServiceCatalogDto updateService(
            @PathVariable Long id,
            @RequestBody ServiceCatalogDto dto) {

        return serviceCatalogService.updateService(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteService(
            @PathVariable Long id) {

        serviceCatalogService.deleteService(id);
    }
}