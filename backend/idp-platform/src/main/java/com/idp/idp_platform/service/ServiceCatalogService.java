package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ServiceCatalogDto;

import java.util.List;

public interface ServiceCatalogService {

    ServiceCatalogDto createService(ServiceCatalogDto dto);

    List<ServiceCatalogDto> getAllServices();

    ServiceCatalogDto getServiceById(Long id);

    ServiceCatalogDto updateService(Long id, ServiceCatalogDto dto);

    void deleteService(Long id);
}