package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.ApprovalDto;
import com.idp.idp_platform.entity.Approval;
import org.springframework.stereotype.Component;

@Component
public class ApprovalMapper {

    public ApprovalDto toDto(Approval approval) {

        return ApprovalDto.builder()
                .id(approval.getId())
                .decision(approval.getDecision().name())
                .comment(approval.getComment())
                .requestId(
                        approval.getRequest() != null
                                ? approval.getRequest().getId()
                                : null
                )
                .approvedById(
                        approval.getApprovedBy() != null
                                ? approval.getApprovedBy().getId()
                                : null
                )
                .build();
    }

}