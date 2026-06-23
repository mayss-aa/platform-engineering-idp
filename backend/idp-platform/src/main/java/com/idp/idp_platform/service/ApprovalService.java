package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ApprovalDto;

import java.util.List;

public interface ApprovalService {

    ApprovalDto createApproval(ApprovalDto dto);

    List<ApprovalDto> getAllApprovals();

    ApprovalDto getApprovalById(Long id);

    void deleteApproval(Long id);

}