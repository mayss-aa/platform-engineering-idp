import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * StatusBadge — renders a color-coded chip for any status value.
 *
 * Usage:
 *   <idp-status-badge [status]="'RUNNING'" [colorMap]="colorMap" size="md" />
 *
 * Design (Requirement 26.2):
 * - status: the current status string (e.g., 'RUNNING', 'FAILED')
 * - colorMap: maps status → CSS class name (e.g., { RUNNING: 'badge-running' })
 * - size: 'sm' | 'md' | 'lg'
 * - Pulse animation when status matches 'RUNNING' (case-insensitive)
 * - No hardcoded colors — all styling via design tokens + colorMap classes
 */
@Component({
  selector: 'idp-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="badge"
      [class]="badgeClass"
      [class.badge--sm]="size === 'sm'"
      [class.badge--lg]="size === 'lg'"
      [class.badge--pulse]="isPulsing"
      [attr.data-testid]="'status-badge'"
      role="status"
      [attr.aria-label]="status"
    >
      {{ status }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--space-0-5) var(--space-2);
      border-radius: var(--radius-badge);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      letter-spacing: var(--letter-spacing-wide);
      white-space: nowrap;
      line-height: 1.4;
      text-transform: uppercase;
    }

    .badge--sm {
      padding: 1px var(--space-1-5);
      font-size: 10px;
    }

    .badge--lg {
      padding: var(--space-1) var(--space-3);
      font-size: var(--font-size-sm);
    }

    .badge--pulse {
      animation: pulse-ring 2s var(--ease-in-out) infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .badge--pulse { animation: none; }
    }

    /* ── Color map classes ──────────────────────────────── */
    .badge-running    { background-color: var(--color-badge-running-bg);    color: var(--color-badge-running-text); }
    .badge-success    { background-color: var(--color-badge-success-bg);    color: var(--color-badge-success-text); }
    .badge-failed     { background-color: var(--color-badge-failed-bg);     color: var(--color-badge-failed-text); }
    .badge-pending    { background-color: var(--color-badge-pending-bg);    color: var(--color-badge-pending-text); }
    .badge-idle       { background-color: var(--color-badge-idle-bg);       color: var(--color-badge-idle-text); }
    .badge-cancelled  { background-color: var(--color-badge-cancelled-bg);  color: var(--color-badge-cancelled-text); }
    .badge-queued     { background-color: var(--color-badge-queued-bg);     color: var(--color-badge-queued-text); }
    .badge-healthy    { background-color: var(--color-badge-healthy-bg);    color: var(--color-badge-healthy-text); }
    .badge-degraded   { background-color: var(--color-badge-degraded-bg);   color: var(--color-badge-degraded-text); }
    .badge-unavailable{ background-color: var(--color-badge-unavailable-bg);color: var(--color-badge-unavailable-text); }
    .badge-approved   { background-color: var(--color-badge-approved-bg);   color: var(--color-badge-approved-text); }
    .badge-rejected   { background-color: var(--color-badge-rejected-bg);   color: var(--color-badge-rejected-text); }
    .badge-provisioned{ background-color: var(--color-badge-provisioned-bg);color: var(--color-badge-provisioned-text); }
    .badge-p1         { background-color: var(--color-badge-p1-bg);         color: var(--color-badge-p1-text); }
    .badge-p2         { background-color: var(--color-badge-p2-bg);         color: var(--color-badge-p2-text); }
    .badge-p3         { background-color: var(--color-badge-p3-bg);         color: var(--color-badge-p3-text); }
    .badge-p4         { background-color: var(--color-badge-p4-bg);         color: var(--color-badge-p4-text); }
    .badge-new        { background-color: var(--color-badge-new-bg);        color: var(--color-badge-new-text); }
    .badge-acknowledged{ background-color: var(--color-badge-acknowledged-bg);color: var(--color-badge-acknowledged-text); }
    .badge-applied    { background-color: var(--color-badge-applied-bg);    color: var(--color-badge-applied-text); }
    .badge-dismissed  { background-color: var(--color-badge-dismissed-bg);  color: var(--color-badge-dismissed-text); }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';
  @Input() colorMap: Record<string, string> = {};
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get badgeClass(): string {
    return this.colorMap[this.status] ?? 'badge-idle';
  }

  get isPulsing(): boolean {
    return this.status.toUpperCase() === 'RUNNING';
  }
}
