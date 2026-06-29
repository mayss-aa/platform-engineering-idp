import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuditLog } from '../models/audit-log.models';
import { ApiGatewayService } from './api-gateway.service';
import { FeatureFlagService } from './feature-flag.service';

/** Filter criteria for audit log queries. */
export interface AuditLogFilters {
  actorName?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  action?: string;
  startDate?: string; // ISO 8601
  endDate?: string;   // ISO 8601
  page?: number;
  pageSize?: number;
}

/**
 * AuditLogService — fetches and exports audit log data.
 *
 * Responsibilities (Requirement 27.7):
 * - getAuditLogs(filters): Observable<AuditLog[]>
 * - exportAuditLogsCsv(filters): Observable<Blob>
 *
 * In MOCK mode: returns static fixture data.
 * In LIVE mode: delegates to ApiGatewayService.
 */
@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly api = inject(ApiGatewayService);
  private readonly flags = inject(FeatureFlagService);

  /**
   * Fetch paginated, filtered audit log entries.
   */
  getAuditLogs(filters?: AuditLogFilters): Observable<AuditLog[]> {
    if (this.flags.isMock('settings')) {
      return of(MOCK_AUDIT_LOGS);
    }
    const params: Record<string, string> = {};
    if (filters?.actorName) params['actorName'] = filters.actorName;
    if (filters?.targetEntityType) params['targetEntityType'] = filters.targetEntityType;
    if (filters?.targetEntityId) params['targetEntityId'] = filters.targetEntityId;
    if (filters?.action) params['action'] = filters.action;
    if (filters?.startDate) params['startDate'] = filters.startDate;
    if (filters?.endDate) params['endDate'] = filters.endDate;
    if (filters?.page != null) params['page'] = String(filters.page);
    if (filters?.pageSize != null) params['pageSize'] = String(filters.pageSize);
    return this.api.get<AuditLog[]>('/audit-logs', { params });
  }

  /**
   * Export audit logs matching the given filters as a CSV file blob.
   */
  exportAuditLogsCsv(filters?: AuditLogFilters): Observable<Blob> {
    if (this.flags.isMock('settings')) {
      const csv = this._generateMockCsv();
      return of(new Blob([csv], { type: 'text/csv' }));
    }
    const params: Record<string, string> = {};
    if (filters?.actorName) params['actorName'] = filters.actorName;
    if (filters?.action) params['action'] = filters.action;
    if (filters?.startDate) params['startDate'] = filters.startDate;
    if (filters?.endDate) params['endDate'] = filters.endDate;
    return this.api.downloadBlob('/audit-logs/export', { params });
  }

  private _generateMockCsv(): string {
    const header = 'Timestamp,Actor,Action,Target Type,Target ID,IP Address\n';
    const rows = MOCK_AUDIT_LOGS.map(
      (l) => `${l.timestamp},${l.actorDisplayName},${l.action},${l.targetEntityType},${l.targetEntityId},${l.ipAddress}`,
    ).join('\n');
    return header + rows;
  }
}

// ─── Mock data ──────────────────────────────────────────────────────────────
const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-001', timestamp: '2025-01-15T10:30:00Z', actorId: 'usr-001', actorDisplayName: 'Admin Engineer', action: 'user.login', targetEntityType: 'User', targetEntityId: 'usr-001', ipAddress: '10.0.1.55' },
  { id: 'log-002', timestamp: '2025-01-15T10:32:00Z', actorId: 'usr-001', actorDisplayName: 'Admin Engineer', action: 'deployment.trigger', targetEntityType: 'Deployment', targetEntityId: 'dep-042', ipAddress: '10.0.1.55' },
  { id: 'log-003', timestamp: '2025-01-15T10:35:00Z', actorId: 'usr-002', actorDisplayName: 'Developer User', action: 'provision-request.create', targetEntityType: 'ProvisionRequest', targetEntityId: 'pr-1042', ipAddress: '10.0.2.10' },
  { id: 'log-004', timestamp: '2025-01-15T11:00:00Z', actorId: 'usr-001', actorDisplayName: 'Admin Engineer', action: 'role.update', targetEntityType: 'Role', targetEntityId: 'role-dev', ipAddress: '10.0.1.55', beforeState: { permissions: 12 }, afterState: { permissions: 14 } },
  { id: 'log-005', timestamp: '2025-01-15T11:15:00Z', actorId: 'usr-003', actorDisplayName: 'Viewer User', action: 'user.login', targetEntityType: 'User', targetEntityId: 'usr-003', ipAddress: '192.168.1.100' },
];
