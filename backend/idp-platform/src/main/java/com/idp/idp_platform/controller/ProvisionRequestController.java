package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.ProvisionRequestDto;
import com.idp.idp_platform.service.ProvisionRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ProvisionRequestController {

    private final ProvisionRequestService requestService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE')")
    public ProvisionRequestDto createRequest(
            @Valid @RequestBody ProvisionRequestDto dto) {

        return requestService.createRequest(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CREATE','APPROVE_REQUEST')")
    public List<ProvisionRequestDto> getAllRequests() {

        return requestService.getAllRequests();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CREATE','APPROVE_REQUEST')")
    public ProvisionRequestDto getRequestById(
            @PathVariable Long id) {

        return requestService.getRequestById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CREATE')")
    public void deleteRequest(
            @PathVariable Long id) {

        requestService.deleteRequest(id);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('APPROVE_REQUEST')")
    public ProvisionRequestDto approveRequest(
            @PathVariable Long id) {

        return requestService.approveRequest(id);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('APPROVE_REQUEST')")
    public ProvisionRequestDto rejectRequest(
            @PathVariable Long id) {

        return requestService.rejectRequest(id);
    }
}