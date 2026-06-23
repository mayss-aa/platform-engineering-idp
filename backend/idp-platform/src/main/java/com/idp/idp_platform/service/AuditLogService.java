package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.AuditLogDto;

import java.util.List;

public interface AuditLogService {

    AuditLogDto createAuditLog(AuditLogDto dto);

    List<AuditLogDto> getAllAuditLogs();

    AuditLogDto getAuditLogById(Long id);

    void deleteAuditLog(Long id);

}