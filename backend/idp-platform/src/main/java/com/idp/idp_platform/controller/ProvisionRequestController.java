package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.ProvisionRequestDto;
import com.idp.idp_platform.service.ProvisionRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class ProvisionRequestController {

    private final ProvisionRequestService requestService;

    @PostMapping
    public ProvisionRequestDto createRequest(
            @RequestBody ProvisionRequestDto dto) {

        return requestService.createRequest(dto);
    }

    @GetMapping
    public List<ProvisionRequestDto> getAllRequests() {

        return requestService.getAllRequests();
    }

    @GetMapping("/{id}")
    public ProvisionRequestDto getRequestById(
            @PathVariable Long id) {

        return requestService.getRequestById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteRequest(
            @PathVariable Long id) {

        requestService.deleteRequest(id);
    }
}