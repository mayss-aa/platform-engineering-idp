package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ServiceCatalogDto;
import com.idp.idp_platform.entity.ServiceCatalog;
import com.idp.idp_platform.mapper.ServiceCatalogMapper;
import com.idp.idp_platform.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCatalogServiceImpl implements ServiceCatalogService {

    private final ServiceCatalogRepository repository;
    private final ServiceCatalogMapper mapper;

    @Override
    public ServiceCatalogDto createService(ServiceCatalogDto dto) {

        ServiceCatalog service = mapper.toEntity(dto);

        return mapper.toDto(
                repository.save(service)
        );
    }

    @Override
    public List<ServiceCatalogDto> getAllServices() {

        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public ServiceCatalogDto getServiceById(Long id) {

        ServiceCatalog service = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Service not found"));

        return mapper.toDto(service);
    }

    @Override
    public ServiceCatalogDto updateService(Long id, ServiceCatalogDto dto) {

        ServiceCatalog service = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Service not found"));

        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setTemplatePath(dto.getTemplatePath());
        service.setVersion(dto.getVersion());

        return mapper.toDto(
                repository.save(service)
        );
    }

    @Override
    public void deleteService(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Service not found");
        }

        repository.deleteById(id);
    }
}