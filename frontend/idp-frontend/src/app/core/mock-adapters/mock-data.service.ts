import { Injectable } from '@angular/core';

/**
 * MockDataService — shared random data generators for all feature Mock_Adapters.
 *
 * Responsibilities (Requirement 27.11):
 * - Provides consistent, realistic mock data generation utilities.
 * - Consumed by every feature module's [feature].mock.service.ts.
 * - Ensures all mock data across the platform looks realistic and coherent.
 *
 * All methods are pure generators — no state, no side effects.
 * Injectable so feature mock services can use Angular DI.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  // ── Identifiers ───────────────────────────────────────────

  /** Generate a UUID v4-like string. */
  uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /** Generate a short ID with prefix (e.g., 'dep-042'). */
  shortId(prefix: string): string {
    return `${prefix}-${String(this.intBetween(1, 999)).padStart(3, '0')}`;
  }

  // ── Random selection ──────────────────────────────────────

  /** Pick a random element from an array. */
  randomFrom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  /** Pick N unique random elements from an array. */
  randomSubset<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, items.length));
  }

  // ── Numbers ───────────────────────────────────────────────

  /** Random integer between min (inclusive) and max (inclusive). */
  intBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Random float between min and max with specified decimal places. */
  floatBetween(min: number, max: number, decimals = 2): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  /** Random percentage (0–100) as a formatted string. */
  percentage(): string {
    return `${this.intBetween(0, 100)}%`;
  }

  // ── Timestamps ────────────────────────────────────────────

  /** ISO 8601 timestamp within the last N hours. */
  timestamp(withinHours = 72): string {
    const now = Date.now();
    const offset = Math.random() * withinHours * 60 * 60 * 1000;
    return new Date(now - offset).toISOString();
  }

  /** ISO 8601 timestamp in the future within N hours. */
  futureTimestamp(withinHours = 24): string {
    const now = Date.now();
    const offset = Math.random() * withinHours * 60 * 60 * 1000;
    return new Date(now + offset).toISOString();
  }

  /** Relative time string (e.g., "2 min ago", "3 hr ago"). */
  relativeTime(): string {
    return this.randomFrom([
      '1 min ago', '2 min ago', '5 min ago', '12 min ago',
      '22 min ago', '35 min ago', '1 hr ago', '2 hr ago',
      '3 hr ago', '5 hr ago', '8 hr ago', '12 hr ago', '1 day ago',
    ]);
  }

  // ── People & Organizations ────────────────────────────────

  /** Realistic user display name. */
  userName(): string {
    return this.randomFrom(FIRST_NAMES) + '.' + this.randomFrom(LAST_NAMES);
  }

  /** Full display name (capitalized). */
  displayName(): string {
    return this.randomFrom(FIRST_NAMES_CAPITALIZED) + ' ' + this.randomFrom(LAST_NAMES_CAPITALIZED);
  }

  /** Organization name. */
  orgName(): string {
    return this.randomFrom(ORG_NAMES);
  }

  /** Team name. */
  teamName(): string {
    return this.randomFrom(TEAM_NAMES);
  }

  /** Email address. */
  email(): string {
    return `${this.userName()}@idp.internal`;
  }

  // ── Infrastructure ────────────────────────────────────────

  /** Service name (e.g., 'auth-service', 'payment-gateway'). */
  serviceName(): string {
    return this.randomFrom(SERVICE_NAMES);
  }

  /** IPv4 address. */
  ipAddress(): string {
    return `${this.intBetween(10, 192)}.${this.intBetween(0, 255)}.${this.intBetween(0, 255)}.${this.intBetween(1, 254)}`;
  }

  /** Semantic version string. */
  version(): string {
    return `${this.intBetween(1, 5)}.${this.intBetween(0, 20)}.${this.intBetween(0, 99)}`;
  }

  /** Kubernetes namespace. */
  k8sNamespace(): string {
    return this.randomFrom(K8S_NAMESPACES);
  }

  /** Azure region. */
  azureRegion(): string {
    return this.randomFrom(AZURE_REGIONS);
  }

  /** Generic status string from a provided list. */
  randomStatus<T extends string>(statuses: T[]): T {
    return this.randomFrom(statuses);
  }

  /** Environment name. */
  environment(): string {
    return this.randomFrom(['production', 'staging', 'development', 'qa', 'preview']);
  }

  /** Git commit hash (short). */
  commitHash(): string {
    return Math.random().toString(16).substring(2, 9);
  }

  /** Docker image reference. */
  dockerImage(): string {
    const name = this.randomFrom(SERVICE_NAMES);
    return `registry.idp.internal/${name}:${this.version()}`;
  }

  /** Duration string (e.g., "2m 34s", "1h 12m"). */
  duration(): string {
    const mins = this.intBetween(0, 120);
    if (mins < 60) return `${mins}m ${this.intBetween(0, 59)}s`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  /** Bytes size (e.g., "245 MB", "1.2 GB"). */
  fileSize(): string {
    return this.randomFrom([
      `${this.intBetween(10, 999)} MB`,
      `${this.floatBetween(1, 5, 1)} GB`,
      `${this.intBetween(100, 900)} KB`,
    ]);
  }
}

// ─── Data pools ─────────────────────────────────────────────────────────────

const FIRST_NAMES = ['alice', 'bob', 'carol', 'david', 'emma', 'frank', 'grace', 'henry', 'iris', 'jack'];
const LAST_NAMES = ['martin', 'chen', 'dubois', 'kwame', 'schulz', 'garcia', 'kumar', 'wilson', 'tanaka', 'mueller'];
const FIRST_NAMES_CAPITALIZED = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
const LAST_NAMES_CAPITALIZED = ['Martin', 'Chen', 'Dubois', 'Kwame', 'Schulz', 'Garcia', 'Kumar', 'Wilson', 'Tanaka', 'Mueller'];

const ORG_NAMES = [
  'Platform Engineering', 'Cloud Operations', 'DevOps Core',
  'Security Team', 'Data Platform', 'SRE Group', 'Infrastructure',
];

const TEAM_NAMES = [
  'Core Platform', 'Cloud Native', 'CI/CD Pipeline', 'Security Ops',
  'Observability', 'Developer Experience', 'Infrastructure Automation',
  'Data Engineering', 'API Platform', 'Release Engineering',
];

const SERVICE_NAMES = [
  'auth-service', 'api-gateway', 'payment-gateway', 'user-service',
  'notification-hub', 'metrics-collector', 'log-aggregator', 'secret-manager',
  'config-server', 'deployment-engine', 'terraform-runner', 'k8s-operator',
  'event-bus', 'cache-service', 'search-indexer', 'file-storage',
  'billing-service', 'audit-trail', 'scheduler-service', 'webhook-relay',
];

const K8S_NAMESPACES = [
  'default', 'kube-system', 'idp-platform', 'monitoring',
  'production', 'staging', 'development', 'ingress-nginx',
  'cert-manager', 'argocd', 'logging', 'istio-system',
];

const AZURE_REGIONS = [
  'westeurope', 'northeurope', 'eastus', 'eastus2',
  'westus2', 'centralus', 'uksouth', 'francecentral',
  'germanywestcentral', 'swedencentral', 'canadacentral', 'australiaeast',
];
