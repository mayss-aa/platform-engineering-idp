import { Pipe, PipeTransform } from '@angular/core';

/**
 * TruncatePipe — truncates a string to a maximum length with ellipsis.
 *
 * Usage: {{ longText | truncate:50 }}
 *        {{ longText | truncate:30:'...' }}
 */
@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 100, suffix = '…'): string {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength).trimEnd() + suffix;
  }
}
