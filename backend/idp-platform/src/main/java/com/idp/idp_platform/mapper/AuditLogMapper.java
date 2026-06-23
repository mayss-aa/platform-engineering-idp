package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.AuditLogDto;
import com.idp.idp_platform.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogDto toDto(AuditLog auditLog) {

        return AuditLogDto.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .resourceType(auditLog.getResourceType())
                .details(auditLog.getDetails())
                .userId(
                        auditLog.getUser() != null
                                ? auditLog.getUser().getId()
                                : null
                )
                .build();
    }

}