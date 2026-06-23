package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.ApprovalDto;
import com.idp.idp_platform.entity.Approval;
import com.idp.idp_platform.entity.ProvisionRequest;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.entity.enums.ApprovalDecision;
import com.idp.idp_platform.mapper.ApprovalMapper;
import com.idp.idp_platform.repository.ApprovalRepository;
import com.idp.idp_platform.repository.ProvisionRequestRepository;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ProvisionRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ApprovalMapper mapper;

    @Override
    public ApprovalDto createApproval(ApprovalDto dto) {

        ProvisionRequest request =
                requestRepository.findById(dto.getRequestId())
                        .orElseThrow(() ->
                                new RuntimeException("Request not found"));

        User approver =
                userRepository.findById(dto.getApprovedById())
                        .orElseThrow(() ->
                                new RuntimeException("Approver not found"));

        Approval approval = Approval.builder()
                .decision(
                        ApprovalDecision.valueOf(
                                dto.getDecision()
                        )
                )
                .comment(dto.getComment())
                .approvedAt(LocalDateTime.now())
                .request(request)
                .approvedBy(approver)
                .build();

        return mapper.toDto(
                approvalRepository.save(approval)
        );
    }

    @Override
    public List<ApprovalDto> getAllApprovals() {

        return approvalRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public ApprovalDto getApprovalById(Long id) {

        return approvalRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException("Approval not found"));
    }

    @Override
    public void deleteApproval(Long id) {

        if (!approvalRepository.existsById(id)) {
            throw new RuntimeException("Approval not found");
        }

        approvalRepository.deleteById(id);
    }

}