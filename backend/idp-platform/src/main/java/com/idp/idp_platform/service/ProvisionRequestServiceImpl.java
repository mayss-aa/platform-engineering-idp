package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ProvisionRequestDto;
import com.idp.idp_platform.entity.ProvisionRequest;
import com.idp.idp_platform.entity.ServiceCatalog;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.entity.enums.RequestStatus;
import com.idp.idp_platform.mapper.ProvisionRequestMapper;
import com.idp.idp_platform.repository.ProvisionRequestRepository;
import com.idp.idp_platform.repository.ServiceCatalogRepository;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

        ServiceCatalog catalog =
                catalogRepository.findById(
                                dto.getServiceCatalogId())
                        .orElseThrow(() ->
                                new RuntimeException("Catalog not found"));

        ProvisionRequest request =
                ProvisionRequest.builder()
                        .status(
                                RequestStatus.valueOf(
                                        dto.getStatus()
                                )
                        )
                        .parameters(dto.getParameters())
                        .createdAt(LocalDateTime.now())
                        .user(user)
                        .serviceCatalog(catalog)
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

        return requestRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Request not found"));
    }

    @Override
    public void deleteRequest(Long id) {

        if (!requestRepository.existsById(id)) {
            throw new RuntimeException(
                    "Request not found");
        }

        requestRepository.deleteById(id);
    }
}