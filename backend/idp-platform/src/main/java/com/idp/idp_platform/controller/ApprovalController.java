package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.ApprovalDto;
import com.idp.idp_platform.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping
    public ApprovalDto createApproval(
            @RequestBody ApprovalDto dto) {

        return approvalService.createApproval(dto);
    }

    @GetMapping
    public List<ApprovalDto> getAllApprovals() {

        return approvalService.getAllApprovals();
    }

    @GetMapping("/{id}")
    public ApprovalDto getApprovalById(
            @PathVariable Long id) {

        return approvalService.getApprovalById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteApproval(
            @PathVariable Long id) {

        approvalService.deleteApproval(id);
    }

}