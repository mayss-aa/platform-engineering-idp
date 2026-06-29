export interface AuditLog {
  id: string;
  timestamp: string; // ISO 8601
  actorId: string;
  actorDisplayName: string;
  action: string;
  targetEntityType: string;
  targetEntityId: string;
  ipAddress: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}
