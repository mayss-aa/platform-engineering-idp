package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.OrganizationDto;
import com.idp.idp_platform.entity.Organization;
import com.idp.idp_platform.mapper.OrganizationMapper;
import com.idp.idp_platform.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Override
    public OrganizationDto createOrganization(OrganizationDto dto) {

        Organization organization =
                OrganizationMapper.toEntity(dto);

        organization.setCreatedAt(LocalDateTime.now());

        return OrganizationMapper.toDto(
                organizationRepository.save(organization)
        );
    }

    @Override
    public List<OrganizationDto> getAllOrganizations() {

        return organizationRepository.findAll()
                .stream()
                .map(OrganizationMapper::toDto)
                .toList();
    }

    @Override
    public OrganizationDto getOrganizationById(Long id) {

        return organizationRepository.findById(id)
                .map(OrganizationMapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException("Organization not found"));
    }
}