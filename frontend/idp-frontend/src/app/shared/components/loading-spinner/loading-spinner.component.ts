import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * LoadingSpinner — accessible animated spinner.
 *
 * Design (Requirement 26 — LoadingSpinner):
 * - size: 'sm' (16px) | 'md' (24px) | 'lg' (40px)
 * - label: accessible ARIA label (default: 'Loading')
 */
@Component({
  selector: 'idp-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="spinner"
      [class.spinner--sm]="size === 'sm'"
      [class.spinner--lg]="size === 'lg'"
      role="status"
      [attr.aria-label]="label || 'Loading'"
    >
      <svg class="spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle class="spinner__track" cx="12" cy="12" r="10" stroke-width="3" />
        <path class="spinner__arc" d="M12 2a10 10 0 0 1 10 10" stroke-width="3" stroke-linecap="round" />
      </svg>
      @if (label) {
        <span class="sr-only">{{ label }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-flex; }

    .spinner { display: inline-flex; align-items: center; justify-content: center; }

    .spinner__svg {
      width: 24px;
      height: 24px;
      animation: spin 0.8s linear infinite;
    }

    .spinner--sm .spinner__svg { width: 16px; height: 16px; }
    .spinner--lg .spinner__svg { width: 40px; height: 40px; }

    .spinner__track {
      stroke: var(--color-border-default);
    }

    .spinner__arc {
      stroke: var(--color-primary);
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner__svg { animation: none; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label?: string;
}
