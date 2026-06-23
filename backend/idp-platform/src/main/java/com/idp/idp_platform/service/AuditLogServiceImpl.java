package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.AuditLogDto;
import com.idp.idp_platform.entity.AuditLog;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.mapper.AuditLogMapper;
import com.idp.idp_platform.repository.AuditLogRepository;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper mapper;

    @Override
    public AuditLogDto createAuditLog(AuditLogDto dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        AuditLog auditLog = AuditLog.builder()
                .action(dto.getAction())
                .resourceType(dto.getResourceType())
                .details(dto.getDetails())
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();

        return mapper.toDto(
                auditLogRepository.save(auditLog)
        );
    }

    @Override
    public List<AuditLogDto> getAllAuditLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public AuditLogDto getAuditLogById(Long id) {

        return auditLogRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException("Audit log not found"));
    }

    @Override
    public void deleteAuditLog(Long id) {

        if (!auditLogRepository.existsById(id)) {
            throw new RuntimeException("Audit log not found");
        }

        auditLogRepository.deleteById(id);
    }

}