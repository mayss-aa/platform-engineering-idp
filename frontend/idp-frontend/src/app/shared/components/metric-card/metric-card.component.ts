import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

/**
 * MetricCard — displays a single KPI value with trend indicator.
 *
 * Design (Requirement 26 — MetricCard spec from design.md):
 * - label: card title
 * - value: primary metric value
 * - unit: optional suffix (%, GB, etc.)
 * - trend: 'up' | 'down' | 'stable' | undefined
 * - loading: renders skeleton placeholder
 * - error: renders error message with retry button
 * - retry: EventEmitter when user clicks retry
 */
@Component({
  selector: 'idp-metric-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-card" [class.metric-card--loading]="loading" [class.metric-card--error]="!!error">
      @if (loading) {
        <div class="metric-card__skeleton">
          <div class="metric-card__skeleton-label"></div>
          <div class="metric-card__skeleton-value"></div>
        </div>
      } @else if (error) {
        <div class="metric-card__error">
          <span class="metric-card__error-icon" aria-hidden="true">&#9888;</span>
          <span class="metric-card__error-msg">{{ error }}</span>
          <button class="metric-card__retry-btn" type="button" (click)="retry.emit()" aria-label="Retry loading">
            Retry
          </button>
        </div>
      } @else {
        <div class="metric-card__header">
          <span class="metric-card__label">{{ label }}</span>
          @if (trend) {
            <span class="metric-card__trend" [class]="'metric-card__trend--' + trend" [attr.aria-label]="'Trend ' + trend">
              {{ trendIcon }}
            </span>
          }
        </div>
        <div class="metric-card__body">
          <span class="metric-card__value">{{ value }}</span>
          @if (unit) {
            <span class="metric-card__unit">{{ unit }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .metric-card {
      background-color: var(--color-surface-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      min-height: 88px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: var(--transition-shadow);
    }

    .metric-card:hover { box-shadow: var(--shadow-sm); }

    .metric-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }

    .metric-card__label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .metric-card__trend {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .metric-card__trend--up { color: var(--color-success); }
    .metric-card__trend--down { color: var(--color-error); }
    .metric-card__trend--stable { color: var(--color-text-tertiary); }

    .metric-card__body {
      display: flex;
      align-items: baseline;
      gap: var(--space-1);
    }

    .metric-card__value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: 1;
    }

    .metric-card__unit {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-regular);
      color: var(--color-text-secondary);
    }

    /* Skeleton */
    .metric-card__skeleton { display: flex; flex-direction: column; gap: var(--space-3); }
    .metric-card__skeleton-label {
      width: 60%;
      height: 12px;
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
      animation: shimmer 1.5s infinite;
      background-size: 200% 100%;
    }
    .metric-card__skeleton-value {
      width: 40%;
      height: 24px;
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
      animation: shimmer 1.5s infinite;
      background-size: 200% 100%;
    }

    @media (prefers-reduced-motion: reduce) {
      .metric-card__skeleton-label,
      .metric-card__skeleton-value { animation: none; }
    }

    /* Error */
    .metric-card__error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      text-align: center;
    }

    .metric-card__error-icon { font-size: var(--font-size-lg); color: var(--color-error); }
    .metric-card__error-msg { font-size: var(--font-size-xs); color: var(--color-text-secondary); }

    .metric-card__retry-btn {
      padding: var(--space-1) var(--space-3);
      background: none;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-button);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      cursor: pointer;
      font-family: var(--font-family-sans);
      transition: var(--transition-color);
    }

    .metric-card__retry-btn:hover {
      background-color: var(--color-surface-2);
    }
  `]
})
export class MetricCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input() unit?: string;
  @Input() trend?: 'up' | 'down' | 'stable';
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() retry = new EventEmitter<void>();

  get trendIcon(): string {
    switch (this.trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
      default: return '';
    }
  }
}
