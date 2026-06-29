import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * EmptyState — rendered when a list or data set has no items.
 *
 * Design (Requirement 26.8):
 * - icon: Material icon name or SVG path (rendered at 48×48px min)
 * - primaryMessage: main descriptive text
 * - secondaryMessage: optional sub-text
 */
@Component({
  selector: 'idp-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" role="status" aria-live="polite">
      <div class="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path [attr.d]="iconPath" />
        </svg>
      </div>
      <p class="empty-state__primary">{{ primaryMessage }}</p>
      @if (secondaryMessage) {
        <p class="empty-state__secondary">{{ secondaryMessage }}</p>
      }
      <div class="empty-state__action">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) var(--space-6);
      text-align: center;
    }

    .empty-state__icon {
      width: 48px;
      height: 48px;
      color: var(--color-text-tertiary);
      margin-bottom: var(--space-4);
    }

    .empty-state__icon svg {
      width: 100%;
      height: 100%;
    }

    .empty-state__primary {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .empty-state__secondary {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      max-width: 360px;
    }

    .empty-state__action {
      margin-top: var(--space-4);
    }
  `]
})
export class EmptyStateComponent {
  @Input({ required: true }) primaryMessage = '';
  @Input() secondaryMessage?: string;
  @Input() icon = '';

  /** Fallback SVG path if no icon specified. */
  get iconPath(): string {
    return this.icon || 'M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4';
  }
}
