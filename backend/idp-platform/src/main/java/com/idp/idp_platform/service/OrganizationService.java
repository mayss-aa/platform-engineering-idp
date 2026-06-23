package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.OrganizationDto;

import java.util.List;

public interface OrganizationService {

    OrganizationDto createOrganization(OrganizationDto dto);

    List<OrganizationDto> getAllOrganizations();

    OrganizationDto getOrganizationById(Long id);
}