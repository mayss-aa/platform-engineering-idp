import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

/**
 * ErrorAlert — displays an error message with optional retry button.
 *
 * Design (Requirement 26 — ErrorAlert):
 * - message: error description text
 * - showRetry: renders retry button
 * - retry: EventEmitter on retry click
 */
@Component({
  selector: 'idp-error-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-alert" role="alert" aria-live="assertive">
      <svg class="error-alert__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z"/>
      </svg>
      <span class="error-alert__message">{{ message }}</span>
      @if (showRetry) {
        <button
          class="error-alert__retry"
          type="button"
          (click)="retry.emit()"
          aria-label="Retry"
        >
          Retry
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .error-alert {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      background-color: var(--color-error-light);
      border: 1px solid var(--color-error);
      border-radius: var(--radius-md);
    }

    .error-alert__icon {
      width: 16px;
      height: 16px;
      color: var(--color-error);
      flex-shrink: 0;
    }

    .error-alert__message {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--color-error-dark);
    }

    .error-alert__retry {
      padding: var(--space-1) var(--space-3);
      background: none;
      border: 1px solid var(--color-error);
      border-radius: var(--radius-button);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-error-dark);
      cursor: pointer;
      font-family: var(--font-family-sans);
      transition: var(--transition-color);
      flex-shrink: 0;
    }

    .error-alert__retry:hover {
      background-color: var(--color-error);
      color: var(--color-primary-contrast);
    }
  `]
})
export class ErrorAlertComponent {
  @Input({ required: true }) message = '';
  @Input() showRetry = false;
  @Output() retry = new EventEmitter<void>();
}
