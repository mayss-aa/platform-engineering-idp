package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ProvisionRequestDto;

import java.util.List;

public interface ProvisionRequestService {

    ProvisionRequestDto createRequest(ProvisionRequestDto dto);

    List<ProvisionRequestDto> getAllRequests();

    ProvisionRequestDto getRequestById(Long id);

    void deleteRequest(Long id);
}