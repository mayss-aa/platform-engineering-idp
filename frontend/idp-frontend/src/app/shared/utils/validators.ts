import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom form validators for the IDP platform.
 */
export class IdpValidators {
  /** Validate that the value is not only whitespace. */
  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string' && control.value.trim().length === 0) {
        return { notBlank: true };
      }
      return null;
    };
  }

  /** Validate minimum length (trimmed). */
  static minTrimmedLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = typeof control.value === 'string' ? control.value.trim() : '';
      if (val.length > 0 && val.length < minLength) {
        return { minTrimmedLength: { requiredLength: minLength, actualLength: val.length } };
      }
      return null;
    };
  }

  /** Validate that passwords match (for confirm-password fields). */
  static passwordsMatch(passwordField: string, confirmField: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordField)?.value;
      const confirm = group.get(confirmField)?.value;
      if (password && confirm && password !== confirm) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  }

  /** Validate a semantic version string (x.y.z). */
  static semver(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const pattern = /^\d+\.\d+\.\d+$/;
      if (!pattern.test(control.value)) {
        return { semver: true };
      }
      return null;
    };
  }
}
