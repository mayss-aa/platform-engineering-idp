import { Pipe, PipeTransform } from '@angular/core';

/**
 * BytesPipe — formats a byte count into a human-readable string.
 *
 * Usage: {{ 1048576 | bytes }}  → "1.00 MB"
 *        {{ 5368709120 | bytes:1 }} → "5.0 GB"
 */
@Pipe({ name: 'bytes', standalone: true, pure: true })
export class BytesPipe implements PipeTransform {
  private readonly units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  transform(value: number | null | undefined, decimals = 2): string {
    if (value == null || isNaN(value)) return '';
    if (value === 0) return '0 B';

    const k = 1024;
    const i = Math.floor(Math.log(Math.abs(value)) / Math.log(k));
    const unit = this.units[Math.min(i, this.units.length - 1)];
    const formatted = (value / Math.pow(k, i)).toFixed(decimals);
    return `${formatted} ${unit}`;
  }
}
