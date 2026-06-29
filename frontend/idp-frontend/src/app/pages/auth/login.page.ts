import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/stores/auth.store';

/**
 * LoginPage — email + password + remember-me form.
 *
 * Requirements 3.1, 3.2, 28.4, 28.5, 28.9:
 * - Valid credentials → navigate to Dashboard or redirect URL
 * - Invalid credentials → inline error, no navigation
 * - Already authenticated → redirect to /dashboard (Req 28.5)
 * - No JWT in URL (Req 3.11)
 */
@Component({
  selector: 'idp-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="login">
      <div class="login__card">
        <div class="login__brand">
          <span class="login__brand-diamond" aria-hidden="true"></span>
          <span class="login__brand-name">IDP Platform</span>
        </div>
        <h1 class="login__title">Sign in to your account</h1>
        <p class="login__subtitle">Enterprise Internal Developer Platform</p>

        @if (authStore.error()) {
          <div class="login__error" role="alert">
            {{ authStore.error() }}
          </div>
        }

        <form class="login__form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="login__field">
            <label class="login__label" for="email">Email address</label>
            <input
              id="email"
              class="login__input"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              autocomplete="email"
              placeholder="admin&#64;idp.internal"
              [disabled]="authStore.loading()"
            />
          </div>

          <div class="login__field">
            <label class="login__label" for="password">Password</label>
            <input
              id="password"
              class="login__input"
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              autocomplete="current-password"
              placeholder="Enter your password"
              [disabled]="authStore.loading()"
            />
          </div>

          <label class="login__remember">
            <input
              type="checkbox"
              name="rememberMe"
              [(ngModel)]="rememberMe"
              class="login__checkbox"
            />
            <span class="login__remember-text">Remember me</span>
          </label>

          <button
            class="login__submit"
            type="submit"
            [disabled]="authStore.loading() || !email || !password"
          >
            @if (authStore.loading()) {
              <span class="login__spinner"></span>
              Signing in...
            } @else {
              Sign in
            }
          </button>
        </form>

        <p class="login__hint">
          Demo accounts: admin&#64;idp.internal / admin123
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .login {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-background);
      padding: var(--space-6);
    }

    .login__card {
      width: 100%;
      max-width: 400px;
      background-color: var(--color-surface-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-xl);
      padding: var(--space-10);
      box-shadow: var(--shadow-lg);
    }

    .login__brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }

    .login__brand-diamond {
      width: 24px;
      height: 24px;
      background-color: var(--color-primary);
      transform: rotate(45deg);
      border-radius: 3px;
    }

    .login__brand-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    .login__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .login__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }

    .login__error {
      padding: var(--space-3) var(--space-4);
      background-color: var(--color-error-light);
      border: 1px solid var(--color-error);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      color: var(--color-error-dark);
      margin-bottom: var(--space-4);
    }

    .login__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .login__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .login__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    .login__input {
      height: 40px;
      padding: 0 var(--space-3);
      background-color: var(--color-surface-2);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: var(--font-family-sans);
      color: var(--color-text-primary);
      outline: none;
      transition: border-color var(--duration-fast) var(--ease-default);
    }

    .login__input::placeholder { color: var(--color-text-tertiary); }
    .login__input:focus { border-color: var(--color-border-focus); box-shadow: var(--shadow-focus); }
    .login__input:disabled { opacity: 0.6; cursor: not-allowed; }

    .login__remember {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
    }

    .login__checkbox { accent-color: var(--color-primary); }

    .login__remember-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .login__submit {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
      border: none;
      border-radius: var(--radius-button);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-family-sans);
      cursor: pointer;
      transition: var(--transition-color);
    }

    .login__submit:hover:not(:disabled) { opacity: 0.9; }
    .login__submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .login__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--color-primary-contrast);
      border-top-color: transparent;
      border-radius: var(--radius-full);
      animation: spin 0.6s linear infinite;
    }

    .login__hint {
      margin-top: var(--space-4);
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      text-align: center;
    }
  `]
})
export class LoginPageComponent {
  readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  rememberMe = false;

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.authService.login({
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    }).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect || '/');
      },
    });
  }
}
