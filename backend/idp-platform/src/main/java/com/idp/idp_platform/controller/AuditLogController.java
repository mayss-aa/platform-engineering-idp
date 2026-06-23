package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.AuditLogDto;
import com.idp.idp_platform.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping
    public AuditLogDto createAuditLog(
            @RequestBody AuditLogDto dto) {

        return auditLogService.createAuditLog(dto);
    }

    @GetMapping
    public List<AuditLogDto> getAllAuditLogs() {

        return auditLogService.getAllAuditLogs();
    }

    @GetMapping("/{id}")
    public AuditLogDto getAuditLogById(
            @PathVariable Long id) {

        return auditLogService.getAuditLogById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteAuditLog(
            @PathVariable Long id) {

        auditLogService.deleteAuditLog(id);
    }

}