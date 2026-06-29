import { Directive, Output, EventEmitter, ElementRef, inject, OnDestroy } from '@angular/core';

/**
 * Click-outside directive — emits when user clicks outside the host element.
 *
 * Usage:
 *   <div (idpClickOutside)="closeMenu()">...</div>
 */
@Directive({
  selector: '[idpClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnDestroy {
  @Output('idpClickOutside') clickOutside = new EventEmitter<void>();

  private readonly elementRef = inject(ElementRef);

  private readonly _handler = (event: MouseEvent): void => {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.clickOutside.emit();
    }
  };

  constructor() {
    // Delay listener attachment to avoid triggering on the same click that opened the element
    setTimeout(() => {
      document.addEventListener('click', this._handler, { passive: true });
    }, 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this._handler);
  }
}
