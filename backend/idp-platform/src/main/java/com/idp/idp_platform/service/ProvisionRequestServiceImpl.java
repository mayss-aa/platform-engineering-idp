package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ProvisionRequestDto;
import com.idp.idp_platform.entity.ProvisionRequest;
import com.idp.idp_platform.entity.ProvisionStatus;
import com.idp.idp_platform.entity.ServiceCatalog;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.exception.ProvisionRequestNotFoundException;
import com.idp.idp_platform.mapper.ProvisionRequestMapper;
import com.idp.idp_platform.repository.ProvisionRequestRepository;
import com.idp.idp_platform.repository.ServiceCatalogRepository;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProvisionRequestServiceImpl
        implements ProvisionRequestService {

    private final ProvisionRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ServiceCatalogRepository catalogRepository;
    private final ProvisionRequestMapper mapper;

    @Override
    public ProvisionRequestDto createRequest(
            ProvisionRequestDto dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ServiceCatalog catalog = catalogRepository
                .findById(dto.getServiceCatalogId())
                .orElseThrow(() ->
                        new RuntimeException("Service Catalog not found"));

        ProvisionRequest request = ProvisionRequest.builder()
                .requestedBy(user)
                .serviceCatalog(catalog)
                .environment(dto.getEnvironment())
                .justification(dto.getJustification())
                .status(ProvisionStatus.PENDING)
                .build();

        return mapper.toDto(
                requestRepository.save(request)
        );
    }

    @Override
    public List<ProvisionRequestDto> getAllRequests() {

        return requestRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public ProvisionRequestDto getRequestById(Long id) {

        ProvisionRequest request = requestRepository.findById(id)
                .orElseThrow(() ->
                        new ProvisionRequestNotFoundException(id));

        return mapper.toDto(request);
    }

    @Override
    public ProvisionRequestDto approveRequest(Long id) {

        ProvisionRequest request = requestRepository.findById(id)
                .orElseThrow(() ->
                        new ProvisionRequestNotFoundException(id));

        request.setStatus(ProvisionStatus.APPROVED);

        return mapper.toDto(
                requestRepository.save(request)
        );
    }

    @Override
    public ProvisionRequestDto rejectRequest(Long id) {

        ProvisionRequest request = requestRepository.findById(id)
                .orElseThrow(() ->
                        new ProvisionRequestNotFoundException(id));

        request.setStatus(ProvisionStatus.REJECTED);

        return mapper.toDto(
                requestRepository.save(request)
        );
    }

    @Override
    public void deleteRequest(Long id) {

        if (!requestRepository.existsById(id)) {
            throw new ProvisionRequestNotFoundException(id);
        }

        requestRepository.deleteById(id);
    }
}