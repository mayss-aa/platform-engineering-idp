import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 403 Forbidden page — shown when RBAC guard denies access (Req 28.6, 28.8).
 */
@Component({
  selector: 'idp-403-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-page__content">
        <span class="error-page__code">403</span>
        <h1 class="error-page__title">Access Denied</h1>
        <p class="error-page__desc">
          You do not have permission to access this resource.
          Contact your administrator if you believe this is an error.
        </p>
        <a class="error-page__link" routerLink="/">Return to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-background);
      padding: var(--space-6);
    }

    .error-page__content { text-align: center; max-width: 420px; }

    .error-page__code {
      font-size: 72px;
      font-weight: var(--font-weight-bold);
      color: var(--color-error);
      line-height: 1;
    }

    .error-page__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: var(--space-4) 0 var(--space-2);
    }

    .error-page__desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin-bottom: var(--space-6);
    }

    .error-page__link {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 var(--space-5);
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
      border-radius: var(--radius-button);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      transition: var(--transition-color);
    }

    .error-page__link:hover { opacity: 0.9; }
  `]
})
export class ForbiddenPageComponent {}
